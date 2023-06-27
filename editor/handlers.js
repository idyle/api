import { calcSize, deleteObject, getObject, insertObject, listObjects, setObject, updateObject } from "../documents/operations.js";
import { uploadFile } from "../objects/operations.js";
import { errHandler } from "../utilities/handlers.js";
import { convertPageToHtml } from "./operations.js";
import { randomBytes } from 'crypto';

export const createHandler = async (req, res) => {
    try {
        const id = randomBytes(8).toString('hex');
        const operation = await insertObject(res?.path, id, req.body?.page);
        if (!operation) return errHandler(res, 'Could not create the page.');
        setObject(`users/${res.user?.uid}/data`, id, { size: calcSize(req.body?.page) });
        return res.json({ status: true, id });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    } 
};

export const editHandler = async (req, res) => {
    try {
        const operation = await updateObject(res?.path, req.params?.id, req.body?.page);
        if (!operation) return errHandler(res, 'Could not edit the page.');
        setObject(`users/${res.user?.uid}/data`, req.params?.id, { size: calcSize(req.body?.page) });
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    } 
};

// export const saveHandler = async (req, res) => {
//     try {
//         const id = req.params?.id ? req.params?.id : randomBytes(8).toString('hex');
//         const operation = await setObject(res?.path, id, req.body?.page);
//         if (!operation) return errHandler(res, 'Could not set a page.');
//         setObject(`users/${res.user?.uid}/data`, id, { size: calcSize(req.body?.page) });
//         return res.json({ status: true, id });
//     } catch (e) {
//         console.error(e);
//         return errHandler(res);
//     }
// };

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

export const getHandler = async (req, res) => {
    try {
        const operation = await getObject(res?.path, req.params?.id);
        if (!operation) return errHandler(res, 'Could not get page.');
        return res.json({ status: true, page: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const deleteHandler = async (req, res) => {
    try {
        const operation = await deleteObject(res?.path, req.params?.id);
        if (!operation) return errHandler(res, 'Could not delete page.');
        deleteObject(`users/${res.user?.uid}/data`, req.params?.id);
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const convertHandler = async (req, res) => {
    try {

        const doc = await getObject(res?.path, req.params?.id);
        if (!doc) return errHandler(res, 'Could not find the page.');

        let page = doc;
        // page === page by default (standard)
        if (req.query?.type === 'custom') page = { data: doc, route: doc?.id, metadata: doc?.metadata };
        // distinguish between a custom and standard input
        console.log('entry page', page);

        const string = convertPageToHtml(page?.data, page?.metadata, page?.route);
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
        for (const page of pages) convertedPages.push({ route: page?.route, string: convertPageToHtml(page?.data, page?.metadata, page?.route) });
        
        // if the request just wants a string
        if (req.query?.output === 'string') return res.json({ status: true, pages: convertedPages });

        let fileUploadPromises = [];
        const objectsPath = `users/${res.user?.uid}/folders/services/objects`;
        for (const { route, string } of convertedPages) fileUploadPromises.push(uploadFile(`${objectsPath}/${route}.html`,string));
        
        const uploadedFiles = await Promise.all(fileUploadPromises);
        for (const uploadedFile of uploadedFiles) if (!uploadedFile) return errHandler(res, 'Could not upload files.');

        return res.json({ status: true });

    } catch (e) {
        console.error(e);
        return false;
    }
};