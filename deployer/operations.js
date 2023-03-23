import 'dotenv/config';
// temporarily import to access creds

import { BackendBucketsClient, GlobalOperationsClient, UrlMapsClient } from '@google-cloud/compute';
import { createBucket } from '../objects/operations';

const backend = new BackendBucketsClient();
const operations = new GlobalOperationsClient();
const mappings = new UrlMapsClient();

const project = process.env.PROJECT;

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


const createBackendBucket = async (uid) => {
    if (!uid) return false;
    try {
        const config = { 
            project,
            backendBucketResource: { name: uid, bucketName: uid }    
        };
        const [ operation ] = await backend.insert(config);
        console.log(operation);
        if (!operation) return false;
        return operation;

    } catch (e) {
        console.error(e);
        return false;
    }
};


const getOperationStatus = async (operationId) => {
    if (!operationId) return false;
    try {
        const config = {
            project,
            operation: operationId
        };
        const [ operation ] = await operations.get(config);
        if (!operation) return false;
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

const createUrlMap = async (uid, backendLink) => {
    if (!uid || !backendLink) return;
    // where backendLink = targetLink
    try {
        const config = {
            project,
            urlMap: 'loadBalancerName',
            urlMapResource: {
                name: 'loadBalancerName',
                pathMatchers: [ { name: `${uid}-path`, defaultService: backendLink } ],
                hostRules: [ { hosts: [ `${uid}.idyle.io` ], pathMatcher: `${uid}-path` } ]
            }
        };
        const [ operation ] = await mappings.update(config);
        console.log(operation);
        if (!operation) return false; //should be a metric to see if it updated
        return operation;
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