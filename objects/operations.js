import { Storage } from "@google-cloud/storage";
import archiver from 'archiver';
import { Writable } from 'stream';

/**
 * Initializes the firebase object using Application Default Credentials (ADC)
 * {@link https://cloud.google.com/docs/authentication/production}
 * In development environments, specify the path of a service account
 * via the @param GOOGLE_APPLICATION_CREDENTIALS variable 
 */

const storage = new Storage();

export const archiveFiles = (files = []) => {
    return new Promise(resolve => {
        const buffs = [];
        const converter = new Writable()
        converter._write = (chunk, encoding, cb) => {
            buffs.push(chunk);
            process.nextTick(cb);
        };
        converter.on('finish', () => resolve(Buffer.concat(buffs)));
        const archive = archiver('tar', { gzip: true, gzipOptions: { zlib: { level: 9 } } } );
        archive.on('error', () => resolve(false));
        archive.pipe(converter);
        for (const file of files) archive.append(file.data, { name: file.name });
        archive.finalize();
    })
};

export const uploadFile = async (path = '', data = '') => { 
    try {
        if (!path) return false;
        await storage.bucket('idyle').file(path).save(data);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const deleteFile = async (path) => {
    try {
        if (!path) return false;
        const operation = await storage.bucket('idyle').file(path).delete();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const listFiles = async (path) => {
    try {
        if (!path) return false;
        let list = [];
        const [operation] = await storage.bucket('idyle').getFiles({ prefix: path });
        if (!operation) return false;
        for (const item of operation) list.push(item.name);
        return list;
    } catch (e) {
        console.error(e);
        return false;    
    }
};

export const downloadFile = async (path) => {
    try {
        if (!path) return false;
        const [operation] = await storage.bucket('idyle').file(path).download();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const archiveFolder = async (path) => {
    try {
        let bufferFilePromises = [], fileNames = [], bufferFiles = [];
        if (!path) return false;
        const files = await listFiles(path);
        if (!files) return false;
        for (const file of files) {
            bufferFilePromises.push(downloadFile(file));
            fileNames.push(file.substring(file.lastIndexOf('/') + 1, file.length));
        };
        const bufferFilesResults = await Promise.all(bufferFilePromises);
        for (let i = 0; i < bufferFilesResults.length; i++) {
            if (!bufferFilesResults[i]) break;
            bufferFiles.push({ name: fileNames[i], data: bufferFilesResults[i] });
        };
        const archivedData = await archiveFiles(bufferFiles);
        if (!archivedData) return false;
        const add = await uploadFile(`archives/${path}.tar.gz`, archivedData);
        if (!add) return false;
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};