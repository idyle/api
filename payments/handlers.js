import { errHandler } from "../utilities/handlers.js";
import { cancelSubscription, confirmCheckoutSession, getCheckoutLink } from "./operations.js";

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