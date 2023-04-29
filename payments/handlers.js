import { listObjects } from "../documents/operations.js";
import { errHandler } from "../utilities/handlers.js";
import { cancelSubscription, confirmCheckoutSession, getCheckoutLink } from "./operations.js";
import config from "../utilities/config.js";

export const checkoutHandler = async (req, res) => {
    try {
        
        const operation = await getCheckoutLink(res.user?.uid, req.params.planId);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true, link: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const confirmHandler = async (req, res) => {
    try {
        const operation = await confirmCheckoutSession(res.user?.uid, req.params.sessionId);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const cancelHandler = async (req, res) => {
    try {
        const operation = await cancelSubscription(res.user?.uid, req.params.subId);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const metricsHandler = async (req, res) => {
    try {
        const list = await listObjects(`users/${res.user?.uid}/data`);
        if (!list) return errHandler(res, 'Could not get data');
        let used = 0, limit = config[res.user?.planType]?.gb;
        for (const { size } of list) used += size;
        used = +(used / (1000 * 1000 * 1000)).toFixed(2);
        const metrics = { limit, used, free: (limit - used) };
        return res.json({ status: true, metrics });
    } catch (e) {
        console.error(e);
        return false;
    }
};