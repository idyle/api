import { calcSize, deleteObject, getObject, listObjects, setObject } from "../documents/operations.js";
import { uploadFile } from "../objects/operations.js";
import { errHandler } from "../utilities/handlers.js";
import { convertPageToHtml } from "./operations.js";

export const saveHandler = async (req, res) => {
    try {
        const operation = await setObject(res?.path, req.params?.page, req.body?.page);
        if (!operation) return errHandler(res, 'Could not set a page.');
        setObject(`users/${res.user?.uid}/data`, req.params?.page, { size: calcSize(req.body?.page) });
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const listHandler = async (req, res) => {
    try {
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
        deleteObject(`users/${res.user?.uid}/data`, req.params?.page);
        return res.json({ status: true});
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const convertHandler = async (req, res) => {
    try {

        console.log('CONVERT REQ CALLED');
        // our default origin is pages
        // IF a query?.custom is specified, replace res?.path with docs

        const page = await getObject(res?.path, req.params?.page);
        if (!page) return errHandler(res, 'Could not find the page.');

        console.log('page data', page);

        const string = convertPageToHtml(page?.data);
        if (!string) return errHandler(res, 'Could not convert the page.');

        // if the request just wants a string
        if (req.query?.output === 'string') return res.json({ status: true, page: page?.route, string });

        const objectsPath = `users/${res.user?.uid}/folders/services/objects`;
        const path = `${objectsPath}/${page?.route}.html`;
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
        for (const { route, data } of pages) convertedPages.push({ route, string: convertPageToHtml(data) });
        
        // if the request just wants a string
        if (req.query?.output === 'string') return res.json({ status: true, pages: convertedPages });

        let fileUploadPromises = [];
        const objectsPath = `users/${res.user?.uid}/collections/services/objects`;
        for (const { route, string } of convertedPages) fileUploadPromises.push(uploadFile(`${objectsPath}/${route}.html`,string));
        
        const uploadedFiles = await Promise.all(fileUploadPromises);
        for (const uploadedFile of uploadedFiles) if (!uploadedFile) return errHandler(res, 'Could not upload files.');

        return res.json({ status: true });

    } catch (e) {
        console.error(e);
        return false;
    }
};