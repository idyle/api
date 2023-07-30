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
            cname: 'https://cdn.idyle.app',
            expires: Date.now() + 12 * 60 * 60 * 1000, // 12 hrs
        };

        const file = storage.bucket(bucket).file(path);
        return {
            name: file.name.split('/')[file.name.split('/').length - 1],
            path: file.name,
            public: (await file.isPublic())[0],
            type: (await file.getMetadata())[0].contentType || 'unknown',
            url: (await file.getSignedUrl(options))[0]
        };

    } catch (e) {
        console.error(e);
        return false;
    }
}

export const uploadFile = async (path = '', data = '', bucket = defaultBucket, metadata) => { 
    try {
        if (!path) return false;
        let options;
        if (metadata) options = { metadata };
        await storage.bucket(bucket).file(path).save(data, options);
        const operation = await getFile(path, bucket);
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
        let list = [];
        const [operation] = await storage.bucket(bucket).getFiles({ prefix: path });
        if (!operation) return false;

        const options = {
            version: 'v4',
            action: 'read',
            cname: 'https://cdn.idyle.app',
            expires: Date.now() + 12 * 60 * 60 * 1000, // 12 hrs
        };

        for (const item of operation) if (info) list.push({
            name: item.name.split(`${path}/`)[1],
            path: item.name,
            public: (await item.isPublic())[0],
            type: item.metadata.contentType || 'unknown',
            url: (await item.getSignedUrl(options))[0]
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

// internal operations created for deployer

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

export const setMetadata = async (bucket, metadata) => {
    if (!bucket || !metadata) return false;
    try {
        const operation = await storage.bucket(bucket).setMetadata(metadata);
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const makePublic = async (bucket) => {
    if (!bucket) return false;
    try {
        const operation = await storage.bucket(bucket).makePublic();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
}; 

export const makeFilePublic = async (path = '', bucket = defaultBucket) => {
    if (!path || !bucket) return false;
    try {
        const operation = await storage.bucket(bucket).file(path).makePublic();
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// const updateCors = async (bucketName = 'cdn.idyle.app') => {
//     try {
//         await storage.bucket(bucketName).setCorsConfiguration([
//             {
//             maxAgeSeconds: 3600,
//             method: ["GET"],
//             origin: ["*"],
//             responseHeader: ["Content-Type"],
//             },
//         ]);

//         console.log(`Bucket ${bucketName} was updated with a CORS config
//         to allow ${"GET"} requests from ${"*"} sharing 
//         ${"Content-Type"} responses across origins`);
//     } catch (e) {
//         console.error(e);
//     }
// };