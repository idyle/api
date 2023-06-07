import { stringify } from 'himalaya';

const convertJSONtoHimalayaJSON = (config) => {
    // we are basing this off our built in JSON
    let children = config.children;
    // divs, imgs, vids are exceptions
    if (config.component === 'div') children = children?.map(child => convertJSONtoHimalayaJSON(child));
    else children = [{ type: 'text', content: config.children || '' }];

    let attributes = [];
    for (let [key, value] of Object.entries(config)) {
        if (key === 'id' || key === 'children' || key === 'component') continue;
        if (value instanceof Array && value?.length < 1) continue;
        if (typeof value === 'object' && Object.values(value)?.length < 1) continue;
        if (key === 'className') key = 'class';
        if (key === 'style') value = JSON.stringify(value).slice(1, -1);
        attributes.push({ key, value });
    };

    // we are returning a {} consistent with himalaya JSON
    return { tagName: config.component, attributes, children };
    // ids are not necessary because we do not display them any way
};

export const convertPageToHtml = (data, metadata, route) => {
    if (!data) return false;
    try {
        const converted = convertJSONtoHimalayaJSON(data);
        if (!converted) return false;
        const stringified = stringify([ converted ]);
        if (!stringified) return false;
        let head = `<title>${route}</title>`, toggle = metadata?.toggle ?? true;
        // metadata contains toggle and css props
        if (metadata?.css) head += `<link rel="stylesheet" type="text/css" href=${metadata?.css} />`;
        if (toggle) head += '<script src="https://cdn.tailwindcss.com"></script>';
        if (metadata?.font) head += `<style>html { font-family: '${metadata?.font}' !important }></style>`;
        return `<html>${head ? `<head>${head}</head>` : ''}<body><div>${stringified}</div></body></html>`;
    } catch (e) {
        console.error(e);
        return false;
    }
};