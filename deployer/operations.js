import { BackendBucketsClient, GlobalOperationsClient, UrlMapsClient } from '@google-cloud/compute';

const backend = new BackendBucketsClient();
const operations = new GlobalOperationsClient();
const mappings = new UrlMapsClient();

const project = process.env.PROJECT;
const loadBalancer = process.env.DEFAULT_LOAD_BALANCER;

export const createInstance = async (websiteName) => {
    if (!websiteName) return false;
    try {
        const config = { 
            project,
            backendBucketResource: { name: websiteName, bucketName: websiteName }    
        };
        const [ operation ] = await backend.insert(config);
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
        if (operation?.error) return false;
        return operation?.status;
    } catch (e) {
        console.error(e);
        return false;
    };
};

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
    try {
        const config = {
            project,
            urlMap: loadBalancer,
            urlMapResource: {
                name: loadBalancer,
                pathMatchers: [ ...list?.pathMatchers, { name: `${websiteName}-path`, defaultService: backendLink } ],
                hostRules: [ ...list?.hostRules, { hosts: [ `${websiteName}.idyle.app` ], pathMatcher: `${websiteName}-path` } ]
            }
        };
        const [ operation ] = await mappings.patch(config);
        if (!operation || operation?.error) return false; 
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};