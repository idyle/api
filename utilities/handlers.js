import { setSubscription } from "../payments/operations.js";
import { verifyJWT } from "../users/operations.js";
import { parseConditions, rateLimit } from "./operations.js";
import config from './config.js';
import { listObjects } from "../documents/operations.js";

export const errHandler = (res, message = 'unknownError') => res.json({ status: false, message });

export const paramHandler = (...params) => {
	return (req, res, next) => {
		const data = { req, res };
		const result = parseConditions(data, params[0], params.slice(1)); 
        if (!result?.status) return errHandler(res, result?.message);
        for (const key of Object.keys(data)) data[`${key}`] = result?.data[`${key}`];
        return next();
	}
};

export const authHandler = async (req, res, next) => {
    try {
        const user = await verifyJWT(req.cookies?.session || req.headers.authorization?.split('Bearer ')[1]);
        if (!user) return errHandler(res, 'authError');
        res.user = user;
        return next();
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }  
};

export const payHandler = async (req, res, next) => {
    try {
        if (!config[res.user?.planType]) return errHandler(res, 'This plan is not valid.');
        if (res.user?.planEnd > (Date.now() / 1000) && config[res.user?.planType]) return next();  
        const set = await setSubscription(res.user?.uid, res.user?.planId);
        if (!set) return errHandler(res, 'payError');
        return next();
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const reqHandler = async (req, res, next) => {
    try {
        const operation = await rateLimit(res.user?.uid, config[res.user?.planType]?.rate);
        if (!operation) return errHandler(res, 'Too many requests');
        return next();
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const dataHandler = async (req, res, next) => {
    try {
        const list = await listObjects(`users/${res.user?.uid}/data`);
        if (!list) return errHandler(res, 'Could not get data');
        let dataUsed = 0;
        for (const { size } of list) dataUsed += size;
        if (dataUsed > config[res.user?.planType]?.data) return errHandler(res, 'GB exceeded');
        return next();
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};