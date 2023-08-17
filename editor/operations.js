import { stringify } from 'himalaya';

const convertJSONtoCSS = (json = {}) => {
    let string = '';
    const entries = Object.entries(json);
    for (let i = 0; i < entries?.length; i++) {
        const [key, value] = entries[i];
        const converted = key?.split(/(?=[A-Z])/)?.join('-')?.toLowerCase();
        if (!converted && !value) continue;
        string += `${converted}: ${value};`;
        if (i < entries?.length - 1) string += ' ';
    };
    return string;
};

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
        if (key === 'style') value = convertJSONtoCSS(value);
        // brand new convert function
        attributes.push({ key, value });
    };

    // we are returning a {} consistent with himalaya JSON
    return { tagName: config.component, attributes, children };
    // ids are not necessary because we do not display them any way
};

export const convertPageToHtml = (data, metadata, name) => {
    if (!data) return false;
    try {
        const converted = convertJSONtoHimalayaJSON(data);
        if (!converted) return false;
        const stringified = stringify([ converted ]);
        if (!stringified) return false;
        let head = `<title>${name}</title>`, toggle = metadata?.toggle ?? true;
        let icon = metadata?.favicon || "https://cdn.idyle.app/assets/idyle.ico";
        const aosCss = `<link rel="stylesheet" type="text/css" href="https://unpkg.com/aos@next/dist/aos.css" />`;
        const aosJs = `<script src="https://unpkg.com/aos@next/dist/aos.js"></script>`;
        const aosInit = `<script>AOS.init();</script>`;
        if (icon) head += `<link rel="icon" href="${icon}" />`
        if (metadata?.css) head += `<link rel="stylesheet" type="text/css" href="${metadata?.css}" />`;
        if (toggle) head += '<script src="https://cdn.tailwindcss.com"></script>';
        if (metadata?.font) head += `<style>html { font-family: '${metadata?.font}' !important }></style>`;
        return `
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${head}
                ${aosCss}
            </head>
            <body>
                <div>${stringified}</div>
                ${aosJs}
                ${aosInit}
            </body>
        </html>`;
    } catch (e) {
        console.error(e);
        return false;
    }
};