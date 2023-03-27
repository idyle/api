import { uploadFile, archiveFolder, deleteFile, downloadFile, listFiles } from './operations';
import { errHandler } from '../utilities/handlers';

export const uploadHandler = async (req, res) => {
    try {
        const operation = await uploadFile(`${res.folder}/${req.params?.file}`, Object.values(req.files)[0]?.data);
        if (!operation) return errHandler(res, 'operationError');
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

export const downloadHandler = async (req, res) => {
    try {
        const operation = await downloadFile(`${res.folder}/${req.params?.file}`);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true, file: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

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