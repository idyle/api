import { setSubscription } from "../payments/operations.js";
import { verifyJWT } from "../users/operations.js";
import { parseConditions } from "./operations.js";

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
        const verify = await verifyJWT(req.cookies?.session || req.headers.authorization?.split('Bearer ')[1]);
        if (!verify) return errHandler(res, 'authError');
        res.user = verify;
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