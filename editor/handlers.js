import { deleteObject, getObject, listObjects, setObject } from "../documents/operations";
import { uploadFile } from "../objects/operations";
import { errHandler } from "../utilities/handlers";
import { convertPageToHtml } from "./operations";

export const saveHandler = async (req, res) => {
    try {
        // req.params?.page and req.body?.data should be validated in routes
        // replace uid with path: users/${res.user?.uid}/collections/services/editor/data/pages
        console.log(req.body.page);
        const operation = await setObject(res?.path, req.params?.page, req.body?.page);
        if (!operation) return errHandler(res, 'Could not set a page.');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const listHandler = async (req, res) => {
    try {
        console.log('received request');
        // accepts queries
        const operation = await listObjects(res?.path, req.query?.filter, req.query?.value);
        if (!operation) return errHandler(res, 'Could not list pages.');
        return res.json({ status: true, pages: operation });
    } catch {
        console.error(e);
        return errHandler(res);
    }
};

export const deleteHandler = async (req, res) => {
    try {
        const operation = await deleteObject(res?.path, req.params?.page);
        if (!operation) return errHandler(res, 'Could not delete page.');
        return res.json({ status: true});
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const convertHandler = async (req, res) => {
    try {

        // our default origin is pages
        // IF a query?.custom is specified, replace res?.path with docs

        const page = getObject(res?.path, req.params?.page);
        if (!page) return errHandler(res, 'Could not find the page.');

        const string = convertPageToHtml(page?.data);
        if (!string) return errHandler(res, 'Could not convert the page.');

        // if the request just wants a string
        if (req.query?.output === 'string') return res.json({ status: true, page: page?.name, string });

        const path = `${page?.name}.html`;
        const upload = await uploadFile(path, string);
        if (!upload) return errHandler(res, 'Could not upload file');

        return res.json({ status: true, path });

    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const convertBatchHandler = async (req, res) => {
    try {
        // exclusive to pages feature
        const pages = await listObjects(res?.path);
        if (!pages) return errHandler(res, 'Could not find pages.');

        // converting for each file
        let convertedPages = [];
        for (const { name, data } of pages) convertedPages.push({ name, string: convertPageToHtml(data) });
        
        // if the request just wants a string
        if (req.query?.output === 'string') return res.json({ status: true, pages: convertedPages });

        let fileUploadPromises = [];
        for (const { name, string } of convertedPages) fileUploadPromises.push(uploadFile(`${name}.html`,string));
        
        const uploadedFiles = await Promise.all(fileUploadPromises);
        for (const uploadedFile of uploadedFiles) if (!uploadedFile) return errHandler(res, 'Could not upload files.');

        return res.json({ status: true });

    } catch (e) {
        console.error(e);
        return false;
    }
};