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
const defaultBucket = process.env.DEFAULT_BUCKET;

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

export const getFile = async (path = '', bucket = defaultBucket) => {
    try {

        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
        
        const file = storage.bucket(bucket).file(path);
        const url = await file.getSignedUrl(options);
        if (!url[0]) return false;
        return url[0];

    } catch (e) {
        console.error(e);
        return false;
    }
}

export const uploadFile = async (path = '', data = '', bucket = defaultBucket) => { 
    try {
        if (!path) return false;
        await storage.bucket(bucket).file(path).save(data);
        const operation = await getFile(path);
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};



export const deleteFile = async (path = '', bucket = defaultBucket) => {
    try {
        if (!path) return false;
        const operation = await storage.bucket(bucket).file(path).delete();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const listFiles = async (path = '', info = false, bucket = defaultBucket) => {
    try {
        if (!path) return false;
        let list = [];
        const [operation] = await storage.bucket(bucket).getFiles({ prefix: path });
        if (!operation) return false;

        const options = {
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };

        for (const item of operation) if (info) list.push({
            name: item.name.split(`${path}/`)[1],
            path: item.name,
            type: item.metadata.contentType || 'unknown',
            url: await item.getSignedUrl(options)
        }); else list.push(item.name);

        return list;
    } catch (e) {
        console.error(e);
        return false;    
    }
};

export const downloadFile = async (path = '', bucket = defaultBucket) => {
    try {
        if (!path) return false;
        const [operation] = await storage.bucket(bucket).file(path).download();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const archiveFolder = async (path = '', bucket = defaultBucket) => {
    try {
        let bufferFilePromises = [], fileNames = [], bufferFiles = [];
        if (!path) return false;
        const files = await listFiles(path, false, bucket);
        if (!files) return false;
        for (const file of files) {
            bufferFilePromises.push(downloadFile(file, bucket));
            fileNames.push(file.substring(file.lastIndexOf('/') + 1, file.length));
        };
        const bufferFilesResults = await Promise.all(bufferFilePromises);
        for (let i = 0; i < bufferFilesResults.length; i++) {
            if (!bufferFilesResults[i]) break;
            bufferFiles.push({ name: fileNames[i], data: bufferFilesResults[i] });
        };
        const archivedData = await archiveFiles(bufferFiles);
        if (!archivedData) return false;
        const add = await uploadFile(`archives/${path}.tar.gz`, archivedData, bucket);
        if (!add) return false;
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// Internal Operations (created for deployer)

export const createBucket = async (bucket, metadata = {}) => {
    if (!bucket) return false;
    try {
        const operation = await storage.createBucket(bucket, metadata);
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};