import { uploadFile, archiveFolder, deleteFile, downloadFile, listFiles, getFile, makeFilePublic } from './operations.js';
import { errHandler } from '../utilities/handlers.js';
import { deleteObject, insertObject } from '../documents/operations.js';

export const uploadHandler = async (req, res) => {
    try {
        const { data, size } = Object.values(req.files)[0]
        const operation = await uploadFile(`${res.folder}/${req.params?.file}`, data);
        if (!operation) return errHandler(res, 'operationError');
        insertObject(`users/${res.user?.uid}/data`, req.params?.file, { size });
        return res.json({ status: true, file: operation });         
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const deleteHandler = async (req, res) => {
    try {
        const operation = await deleteFile(`${res.folder}/${req.params?.file}`);
        if (!operation) return errHandler(res, 'operationError');
        deleteObject(`users/${res.user?.uid}/data`, req.params?.file);
        return res.json({ status: true });     
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const listHandler = async (req, res) => {
    try {
        const operation = await listFiles(`${res.folder}`, true);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true, list: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const getHandler = async (req, res) => {
    try {
        let operation;
        if (req.query?.type === 'download') operation = await downloadFile(`${res.folder}/${req.params?.file}`);
        else operation = await getFile(`${res.folder}/${req.params?.file}`);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true, file: operation });     
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

// export const downloadHandler = async (req, res) => {
//     try {
//         const operation = await downloadFile(`${res.folder}/${req.params?.file}`);
//         if (!operation) return errHandler(res, 'operationError');
//         return res.json({ status: true, file: operation });
//     } catch (e) {
//         console.error(e);
//         return errHandler(res);
//     }
// };

export const archiveHandler = async (req, res) => {
    try {
        const operation = await archiveFolder(`${res.folder}`);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const publicHandler = async (req, res) => {
    try {
        const operation = await makeFilePublic(`${res.folder}/${req.params?.file}`)
        if (!operation) return errHandler(res, 'Could not make the file public.');
        return res.json({ status: true }); 
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};