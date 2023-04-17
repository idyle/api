import { setSubscription } from "../payments/operations.js";
import { verifyJWT } from "../users/operations.js";
import { parseConditions } from "./operations.js";
import { decode } from 'jsonwebtoken';

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
        if (res.user?.planEnd > (Date.now() / 1000)) return next();
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
        const user = decode(req.headers.authorization?.split('Bearer ')[1]);
        // aggregate query with user?.uid

    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};