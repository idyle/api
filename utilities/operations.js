const setObjectFromPath = (data, path, value) => {
    let current = data;
    for (let depth = 0; depth < path.length - 1; depth++) current = current[path[depth]];
    current[path[path.length - 1]] = value;
    return data;
};

const convertPathToString = (data, path) => {
    let current = data;
    for (let depth = 0; depth < path.length - 1; depth++) current = current[path[depth]];
    return current[path[path.length - 1]];
};

const convertArgumentToPath = (data, argument, path = []) => {
    let { from, find } = argument;
    if (typeof from === 'object') path = [...convertArgumentToPath(data, from, path)];
    if (typeof find === 'object') path = [...convertArgumentToPath(data, find, path)];
    if (typeof from === 'string') path.push(from);
    if (typeof find === 'string') path.push(find);
    return path;
};

export const parseConditions = (data, type, conditions) => {
    let errorMessages = [], operation = { status: false };
	for (const condition of conditions) {
		if (condition instanceof Array) operation = parseConditions(data, condition[0], condition.slice(1));
        else {
			let { firstArg, secondArg, equality, type, existence, assign, template, prefilter, origin, message } = condition;
            let firstArgPath, secondArgPath;
            if (firstArg) firstArgPath = convertArgumentToPath(data, firstArg);
            if (secondArg) secondArgPath = convertArgumentToPath(data, secondArg);
            let actionOriginPath = firstArgPath;
			if (firstArg && typeof firstArg !== 'string') firstArg = convertPathToString(data, firstArgPath);
			if (secondArg && typeof secondArg !== 'string') secondArg = convertPathToString(data, secondArgPath);
			if (equality && secondArg) operation = (firstArg === secondArg) ? { status: true } : { status: false, message };
            if (type && firstArg) operation = (typeof firstArg === type) ? { status: true } : { status: false, message };
            if (existence && firstArg) operation = { status: true };
            if (!firstArg) operation = { status: false, message };
            if (operation.status && (assign || template) && origin === 'secondArg' && secondArgPath) actionOriginPath = secondArgPath;
            // allow origin to be customizable, exhibiting the same behavior of firstarg/secondarg
            if (operation.status && (assign || template) && origin && typeof origin !== 'string') actionOriginPath = convertArgumentToPath(data, origin);
            if (operation.status && template) data = setObjectFromPath(data, actionOriginPath, template.replace(/\*/g, firstArg));
            if (operation.status && assign && typeof assign !== 'string') assign = convertPathToString(data, convertArgumentToPath(data, assign));
            if (operation.status && assign) data = setObjectFromPath(data, actionOriginPath, assign);
            if (operation.status && prefilter && typeof prefilter.lookup !== 'string') prefilter.lookup = convertPathToString(data, convertArgumentToPath(data, prefilter.lookup));
            if (operation.status && prefilter && typeof prefilter.match !== 'string') prefilter.match = convertPathToString(data, convertArgumentToPath(data, prefilter.match));
            if (operation.status && prefilter) data = setObjectFromPath(data, ['res', 'filter'], prefilter);
		};
        if (operation.message) errorMessages.push(operation.message);
        if ((operation.status && type === 'any') || (!operation.status && type === 'all')) return { ...operation, data }; 
	};
    if (!errorMessages.length) errorMessages.push('unknownError');
	if (type === 'any') return { status: false, message: errorMessages, data };
	else if (type === 'all') return { status: true, data };
    else if (type === 'optional') return { status: true, data }
};