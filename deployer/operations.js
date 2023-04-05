import 'dotenv/config';
// temporarily import to access creds (remove redundancy when done)

import { stringify } from 'himalaya';
import { BackendBucketsClient, GlobalOperationsClient, UrlMapsClient } from '@google-cloud/compute';
// import { createBucket } from '../objects/operations';

const backend = new BackendBucketsClient();
const operations = new GlobalOperationsClient();
const mappings = new UrlMapsClient();

const project = process.env.PROJECT;
const loadBalancer = process.env.DEFAULT_LOAD_BALANCER;

// processes like CREATING A BUCKET and uploading a file are delegated to objects
// object operations needs editing to allow for bucket name to be changed

// METADATA for bucket creation (for a website)
// const metadata = {
//     location: 'US-CENTRAL1',
//     website: {
//         mainPageSuffix: 'index.html',
//         notFoundPage: '404.html'
//     }
// };

// createBucket('sample bucket name', metadata);


export const createInstance = async (websiteName) => {
    if (!websiteName) return false;
    try {
        const config = { 
            project,
            backendBucketResource: { name: websiteName, bucketName: websiteName }    
        };
        const [ operation ] = await backend.insert(config);
        console.log(operation);
        if (!operation || operation?.error) return false;
        return operation;

    } catch (e) {
        console.error(e);
        return false;
    }
};


export const trackOperationStatus = async (operationId) => {
    if (!operationId) return false;
    try {
        const config = {
            project,
            operation: operationId
        };
        const [ operation ] = await operations.wait(config);
        console.log('RESULT OF WIATING', operation);
        if (operation?.error) return false;
        return operation?.status;
    } catch (e) {
        console.error(e);
        return false;
    };
};

// NEEDS TESTING WITH ACTUAL LOAD BALANCER / UNTESTED OP
/** 
 * NEEDS TESTING WITH ACTUAL LOAD BALANCER / UNTESTED OP\
 * SDK REFERENCE
 * {@link https://cloud.google.com/nodejs/docs/reference/compute/latest/compute}
 * API REFERENCE
 * {@link https://cloud.google.com/compute/docs/reference/rest/v1}
 */

const listMappings = async () => {
    try {
        const config = { project };
        const [ [ operation ] ] = await mappings.list(config);
        if (!operation || operation?.error) return false;
        return operation;

    } catch (e) {
        console.error(e);
        return false;
    }
};

export const createMapping = async (websiteName, backendLink) => {
    if (!websiteName || !backendLink) return false;

    const list = await listMappings();
    if (!list) return false;
    // where backendLink = targetLink
    try {
        const config = {
            project,
            urlMap: loadBalancer,
            urlMapResource: {
                name: loadBalancer,
                pathMatchers: [ ...list?.pathMatchers, { name: `${websiteName}-path`, defaultService: backendLink } ],
                hostRules: [ ...list?.hostRules, { hosts: [ `${websiteName}.idyle.io` ], pathMatcher: `${websiteName}-path` } ]
            }
        };
        const [ operation ] = await mappings.patch(config);
        console.log('RESULT OF MAPPING', operation);
        if (!operation || operation?.error) return false; //should be a metric to see if it updated
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const convertToHtml = (data) => {
    if (!data) return false;
    try {
        let mainElements = [];
        let mainChildren = data?.children;
        if (mainChildren instanceof Array) for (const mainChild of mainChildren) {
            let children = mainChild?.children;
            if (mainChild?.component === 'h1') children = [{ type: 'text', content: mainChild?.children || '' }];
            else children = children?.map(child => convertJSONtoHimalayaJSON(child));
        
            let attributes = [];
            for (let [key, value] of Object.entries(mainChild)) {
                if (key === 'id' || key === 'children' || key === 'component') continue;
                if (key === 'className') key = 'class';
                attributes.push({ key, value });
            };
        
            // we are returning a {} consistent with himalaya JSON
            mainElements.push({ tagName: mainChild?.component, attributes, children });
            // ids are not necessary because we do not display them any way
        };
 
        const stringified = stringify(mainElements);
        if (!stringified) return false;
        return `<html>${stringified}</html>`;
    } catch (e) {
        console.error(e);
        return false;
    }
};

// STEPS

// 1. Create a bucket and set parameters
// 2. Add files (good)
// 3. Create a backend bucket
// 4. URL Map


// create backend bucket

// createBackendBucket('marcusimperial')
// .then(a => console.log(a));

// check status of backend bucket

// getOperationStatus('operation-1679644372832-5f7a0ae311090-db4483cb-76fd7aac')
// .then(a => console.log(a));

// createUrlMap('marcusimperial', 'https://www.googleapis.com/compute/v1/projects/idyleio/global/backendBuckets/marcusimperial')
// .then(a => console.log(a));
//https://www.googleapis.com/compute/v1/projects/idyleio/global/backendBuckets/marcusimperial
