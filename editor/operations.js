import { stringify } from 'himalaya';

export const convertPageToHtml = (data) => {
    if (!data) return false;
    try {
        let mainElements = [];
        let mainChildren = data?.children;
        if (mainChildren instanceof Array) for (const mainChild of mainChildren) {
            let children = mainChild?.children;
            if (mainChild?.component === 'h1') children = [{ type: 'text', content: mainChild?.children || '' }];
            else children = children?.map(child => convertJSONtoHimalayaJSON(child));
        
            let attributes = [];
            for (let [key, value] of Object.entries(mainChild)) {
                if (key === 'id' || key === 'children' || key === 'component') continue;
                if (key === 'className') key = 'class';
                attributes.push({ key, value });
            };
        
            // we are returning a {} consistent with himalaya JSON
            mainElements.push({ tagName: mainChild?.component, attributes, children });
            // ids are not necessary because we do not display them any way
        };
 
        const stringified = stringify(mainElements);
        if (!stringified) return false;
        return `<html><head><script src="https://cdn.tailwindcss.com"></script></head><body><div>${stringified}</div></body></html>`;
    } catch (e) {
        console.error(e);
        return false;
    }
};