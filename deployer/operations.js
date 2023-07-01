import { BackendBucketsClient, GlobalOperationsClient, UrlMapsClient } from '@google-cloud/compute';
import fetch from 'node-fetch';

const backend = new BackendBucketsClient();
const operations = new GlobalOperationsClient();
const mappings = new UrlMapsClient();

const project = process.env.PROJECT;
const defaultLoadBalancer = process.env.DEFAULT_LOAD_BALANCER;

export const createInstance = async (websiteName, bucketName, enableCdn = false) => {
    if (!websiteName || !bucketName) return false;
    try {
        const config = { 
            project,
            backendBucketResource: { name: websiteName, bucketName, enableCdn }    
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
        console.log(operation?.error?.errors);
        if (operation?.error) return false;
        return operation?.status;
    } catch (e) {
        console.error(e);
        return false;
    };
};

export const listMappings = async () => {
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

export const setMappings = async (pathMatchers, hostRules) => {
    if (!pathMatchers || !hostRules) return false;
    try {
        const config = {
            project,
            urlMap: defaultLoadBalancer,
            urlMapResource: { name: defaultLoadBalancer, pathMatchers, hostRules }
        };
        const [ operation ] = await mappings.patch(config);
        if (!operation || operation?.error) return false; 
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const createMapping = async (websiteName, backendLink) => {
    if (!websiteName || !backendLink) return false;
    try {
        const list = await listMappings();
        if (!list) return false;
        let pathMatchers = [ ...list?.pathMatchers, { name: `${websiteName}-path`, defaultService: backendLink } ];
        let hostRules = [ ...list?.hostRules, { hosts: [ `${websiteName}.idyle.app` ], pathMatcher: `${websiteName}-path` } ];
        const operation = await setMappings(pathMatchers, hostRules)
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false;
    }

};

export const removeMapping = async (websiteName) => {
    if (!websiteName) return false;
    try {
        const list = await listMappings();
        if (!list) return false;
        let pathMatchers = list?.pathMatchers?.filter(( { name } ) => name !== `${websiteName}-path`);
        let hostRules = list?.hostRules?.filter(( { pathMatcher }) => pathMatcher !== `${websiteName}-path`);
        const operation = await setMappings(pathMatchers, hostRules);
        if (!operation) return false;
        return operation;
    } catch (e) {
        console.error(e);
        return false
    }
};

export const connectDomain = async (domain) => {
    if (!domain) return false;
    try {
        const zoneIdentifier = process.env.CLOUDFLARE_ZONE_ID;
        const token = process.env.CLOUDFLARE_API_KEY;
        const url = `https://api.cloudflare.com/client/v4/zones/${zoneIdentifier}/custom_hostnames`;

        const body = {
            hostname: domain,
            ssl: {
                bundle_method: 'ubiquitous',    
                type: 'dv',
                method: 'http'
            }
        };
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        };

        const req = await fetch(url, options);
        const res = await req.json();
        if (!res?.success) return false;
        return res?.result;

    } catch (e) {
        console.error(e);
        return false;
    }
};

export const disconnectDomain = async (id) => {
    if (!id) return false;
    try {
        const zoneIdentifier = process.env.CLOUDFLARE_ZONE_ID;
        const token = process.env.CLOUDFLARE_API_KEY;
        const url = `https://api.cloudflare.com/client/v4/zones/${zoneIdentifier}/custom_hostnames/${id}`;
        
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        };

        const req = await fetch(url, options);
        const res = await req.json();
        if (!res?.success) return false;
        return res?.result;

    } catch (e) {
        console.error(e);
        return false;
    }
};