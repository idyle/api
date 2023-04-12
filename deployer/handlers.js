import { getObject, insertObject, listObjects, setObject } from "../documents/operations.js";
import { createBucket, deleteFile, downloadFile, listFiles, makePublic, setMetadata, uploadFile } from "../objects/operations.js";
import { errHandler } from "../utilities/handlers.js";
import { createInstance, createMapping, trackOperationStatus } from "./operations.js";
import { randomBytes } from 'crypto';

export const setupHandler = async (req, res) => {
    try {
        // registering the app name 
        const register = await insertObject(`websites`, req.params?.website, { uid: res.user?.uid });
        // saving a website name via db to avoid duplicates
        if (!register) return errHandler(res, 'Website name taken.');

        const record = await setObject(`users`, res.user?.uid, { website: { name: req.params?.website } });
        if (!record) return errHandler(res, 'Could not record website.');

        const bucket = await createBucket(req.params?.website);
        // creates bucket; set metadata through another op.
        if (!bucket) return errHandler(res, 'Source could not be created.');

        // make public
        const expose = await makePublic(req.params?.website);
        if (!expose) return errHandler(res, 'Could not make the website public.');

        const instance = await createInstance(req.params?.website);
        if (!instance) return errHandler(res, 'Instance could not be created.');

        // wait for the operation to be completed before adding the mapping
        const status = await trackOperationStatus(instance?.name);
        if (!status) return errHandler(res, 'An error occured with the instance');

        const mapping = await createMapping(req.params?.website, instance?.latestResponse?.targetLink);
        if (!mapping) return errHandler(res, 'Could not create mapping');

        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const websiteHandler = async (req, res) => {
    try {
        const operation = await getObject('users', res.user?.uid);
        if (!operation) return errHandler(res, 'Could not get user.');
        if (!operation?.website) return errHandler(res, 'The user has no websites.');
        return res.json({ status: true, website: operation?.website });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const deployHandler = async (req, res) => {
    try {
        // we only accept file sources originating from users/*/folders/services/objects

        // verify that the user owns the website (whole-net db)
        const website = await getObject('websites', req.params?.website);
        if (website?.uid !== res.user?.uid) return errHandler(res, 'User does not own website.');

        const currentFiles = await listFiles('', false, req.params?.website);
        // difference between this op returning false and having length === 0
        if (!currentFiles) return errHandler(res, 'Could not get bucket.');

        let deleteFilePromises = [];
        for (const currentFile of currentFiles) deleteFilePromises.push(deleteFile(currentFile, req.params?.website));
        const deletedFiles = await Promise.all(deleteFilePromises);
        for (const deletedFile of deletedFiles) if (!deletedFile) return errHandler(res, 'Could not remove past files');
        // we're deleting files in bulk to prep for new file insertions

        let fileBufferPromises = [], newFileNames = [], finalFiles = [], stagedFiles = req.body?.files || [];
        const deployPath = `users/${res.user?.uid}/collections/services/deployer`;
        const objectsPath = `users/${res.user?.uid}/folders/services/objects`
        let id = randomBytes(8).toString('hex');

        // checking if the request to revert an old deploy, specifying old id
        if (req.query?.revert) { 
            const deploy = await getObject(deployPath, req.query?.revert);
            if (!deploy) return errHandler(res, 'Could not find deploy.');
            stagedFiles = deploy?.files;
            id = deploy?.id;
        };
        
        // FULL PATH is required ; edit what is returned from objects
        for (const { path: newFilePath } of stagedFiles) {
            // downloading our files from main user db
            fileBufferPromises.push(downloadFile(`${objectsPath}/${newFilePath}`));
            newFileNames.push(newFilePath.substring(newFilePath.lastIndexOf('/') + 1, newFilePath.length));
        };

        const fileBufferResults = await Promise.all(fileBufferPromises);
        for (let i = 0; i < fileBufferResults.length; i++) {
            if (!fileBufferResults[i]) return errHandler(res, 'Could not transfer files.');
            finalFiles.push({ path: newFileNames[i], data: fileBufferResults[i] });
        };

        let uploadedFilePromises = [];
        for (const { path, data } of finalFiles) uploadedFilePromises.push(uploadFile(path, data, req.params?.website));
        // uploading into the website
        
        const uploadedFiles = await Promise.all(uploadedFilePromises);
        for (const uploadedFile of uploadedFiles) if (!uploadedFile) return errHandler(res, 'Could not upload files.');

        // set metadata
        const mainPageSuffix = (stagedFiles?.find(({ index }) => index) || stagedFiles[0])?.path;
        const metadata = await setMetadata(req.params?.website, { website: { mainPageSuffix } });
        if (!metadata) return errHandler(res, 'Could not set website metadata.');

        const timestamp = Date.now();
        const record = await setObject(deployPath, id, { files: [ ...stagedFiles ], timestamp });
        // we are SETTING instead of inserting in case the op is to revert an existing deploy
        // we need to use the full path of the file in order to reference it in the future
        // uploading into the web bucket
        if (!record) return errHandler(res, 'Could not compelete deploy');

        const activate = await setObject(`users`, res.user?.uid, { website: { deploy: id } }, true);
        if (!activate) return errHandler(res, 'Could not activate website.');

        return res.json({ status: true, id, timestamp });

    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const listHandler = async (req, res) => {
    // 1: list objects of deploys with file
    try {
        const deployPath = `users/${res.user?.uid}/collections/services/deployer`;
        const operation = await listObjects(deployPath, req.query?.filter, req.query?.value);
        if (!operation) return errHandler(res, 'Operation error.');
        return res.json({ status: true, list: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};