import { calcSize, getObject, insertObject, listObjects, setObject } from "../documents/operations.js";
import { createBucket, deleteFile, downloadFile, listFiles, makePublic, setMetadata, uploadFile } from "../objects/operations.js";
import { errHandler } from "../utilities/handlers.js";
import { connectDomain, createInstance, createMapping, disconnectDomain, listMappings, setMappings, trackOperationStatus } from "./operations.js";
import { randomBytes } from 'crypto';
import config from '../utilities/config.js';

export const getWebsiteHandler = async (req, res) => {
    try {
        const path = `users/${res.user?.uid}/collections/services/deployer/data/websites`;
        if (req.params?.website) {
            const website = await getObject(path, req.params?.website);
            if (!website) return errHandler(res, 'Failed to get website.');
            return res.json({ status: true, website });
        }; 
        const websites = await listObjects(path, req.query?.filter, req.query?.value);
        if (!websites) return errHandler(res, 'Failed to list websites.');
        return res.json({ status: true, websites });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const postWebsiteHandler = async (req, res) => {
    try {
        const path = `users/${res.user?.uid}/collections/services/deployer/data/websites`;
        const websites = await listObjects(path, req.query?.filter, req.query?.value);
        if (!websites) return errHandler(res, 'Failed to list websites.');
        if (websites?.length >= config[res.user?.planType]?.websites) return errHandler(res, 'Website limit reached.');
        // Restrict # of creatable websites based on user's plan
        const source = `${req.params?.website}.idyle.app`;
        // const source = `idyle-${randomBytes(8).toString('hex')}`;
        // registering the app name 
        const register = await insertObject(`websites`, req.params?.website, { uid: res.user?.uid, source });
        // saving a website name via db to avoid duplicates
        if (!register) return errHandler(res, 'Website name taken.');
        const record = await insertObject(path, req.params?.website, { website: { name: req.params?.website, source } });
        // const record = await setObject(`users`, res.user?.uid, { website: { name: req.params?.website, source } });
        if (!record) return errHandler(res, 'Could not record website.');
        const bucket = await createBucket(source);
        // creates bucket; set metadata through another op.
        if (!bucket) return errHandler(res, 'Source could not be created.');
        // make public
        const expose = await makePublic(source);
        if (!expose) return errHandler(res, 'Could not make the website public.');
        const instance = await createInstance(req.params?.website, source, config[res.user?.planType]?.network === 'premium');
        // Instances should be updated/deleted if the plan is changed
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

export const deployGetHandler = async (req, res) => {
    try {
        const deployPath = `users/${res.user?.uid}/collections/services/deployer/data/deploys`;
        const operation = await listObjects(deployPath, req.query?.filter, req.query?.value);
        if (!operation) return errHandler(res, 'Operation error.');
        return res.json({ status: true, list: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const deployPostHandler = async (req, res) => {
    try {
        const path = `users/${res.user?.uid}/collections/services/deployer/data/websites`;
        // verify that the user owns the website (whole-net db)
        const website = await getObject('websites', req.params?.website);
        if (website?.uid !== res.user?.uid) return errHandler(res, 'User does not own website.');

        const currentFiles = await listFiles('', false, website?.source);
        // difference between this op returning false and having length === 0
        if (!currentFiles) return errHandler(res, 'Could not get bucket.');

        let deleteFilePromises = [];
        for (const currentFile of currentFiles) deleteFilePromises.push(deleteFile(currentFile, website?.source));
        const deletedFiles = await Promise.all(deleteFilePromises);
        for (const deletedFile of deletedFiles) if (!deletedFile) return errHandler(res, 'Could not remove past files');
        // we're deleting files in bulk to prep for new file insertions

        let fileBufferPromises = [], newFileNames = [], finalFiles = [], stagedFiles = req.body?.files || [];
        const deployPath = `users/${res.user?.uid}/collections/services/deployer/data/deploys`;
        const objectsPath = `users/${res.user?.uid}/folders/services/objects`;
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
        for (const { path, data } of finalFiles) uploadedFilePromises.push(uploadFile(path.split('.')?.[0], data, website?.source, { contentType: 'text/html' }));
        const uploadedFiles = await Promise.all(uploadedFilePromises);
        for (const uploadedFile of uploadedFiles) if (!uploadedFile) return errHandler(res, 'Could not upload files.');
        // uploading into the website
        const mainPageSuffix = (stagedFiles?.find(({ index }) => index) || stagedFiles[0])?.path?.split('.')?.[0];
        const metadata = await setMetadata(website?.source, { website: { mainPageSuffix } });
        if (!metadata) return errHandler(res, 'Could not set website metadata.');

        const timestamp = Date.now();
        const deployObject = { website: req.params?.website, files: [ ...stagedFiles ], timestamp };
        const record = await setObject(deployPath, id, deployObject);
        // we are SETTING instead of inserting in case the op is to revert an existing deploy
        // we need to use the full path of the file in order to reference it in the future
        if (!record) return errHandler(res, 'Could not complete deploy');
        const activate = await setObject(path, req.params?.website, { website: { deploy: id } }, true);
        if (!activate) return errHandler(res, 'Could not activate website.');
        setObject(`users/${res.user?.uid}/data`, id, { size: calcSize(deployObject) });
        // (new) record data size
        return res.json({ status: true, id, timestamp });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const domainPostHandler = async (req, res) => {
    try {
        const path = `users/${res.user?.uid}/collections/services/deployer/data/websites`;
        const { website } = await getObject(path, req.params?.website);
        if (!website) return errHandler(res, 'Could not get website.');
        if (website?.domain?.id) return errHandler(res, 'Domain already exists');
        // operation via API request to cloudflare; needs creds 
        const connect = await connectDomain(req.params?.domain);
        if (!connect) return errHandler(res, 'Could not connect domain.');
        const mappings = await listMappings();
        if (!mappings) return errHandler(res, 'Could not prepare mapping.');
        const mapping = await setMappings(mappings?.pathMatchers, [ ...mappings?.hostRules, { hosts: [ req.params?.domain ], pathMatcher: `${website?.name}-path` } ]);
        if (!mapping) return errHandler(res, 'Could not create domain mapping');
        setObject(path, req.params?.website, { website: { domain: { name: req.params?.domain, id: connect?.id } } }, true);
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const domainDeleteHandler = async (req, res) => {
    try {
        const path = `users/${res.user?.uid}/collections/services/deployer/data/websites`;
        const { website } = await getObject(path, req.params?.website);
        if (!website) return errHandler(res, 'Could not get website.');
        if (!website?.domain?.id) return errHandler(res, 'No domain exists'); 
        const disconnect = await disconnectDomain(website?.domain?.id);
        if (!disconnect) return errHandler(res, 'Could not disconnect domain.');
        const mappings = await listMappings();
        if (!mappings) return errHandler(res, 'Could not prepare mapping.');
        const mapping = await setMappings(mappings?.pathMatchers, mappings?.hostRules?.filter(( { hosts }) => hosts[0] !== website?.domain?.name )); 
        if (!mapping) return errHandler(res, 'Could not remove domain mapping');
        setObject(path, req.params?.website, { website: { domain: null } }, true);
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};