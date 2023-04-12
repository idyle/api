import { decodeJWT, generateSession, getUserByUid, revokeSession, verifyJWT } from './operations.js';
import { errHandler } from '../utilities/handlers.js';

export const generateHandler = async (req, res) => {
    try {
        const sessionCookie = await generateSession(req.headers.authorization?.split('Bearer ')[1]);
        if (!sessionCookie) return errHandler(res, 'operationError');
        const cookieOptions = { maxAge: sessionCookie.expiry.expiresIn, httpOnly: true, secure: true, domain: 'idyle.io' };
        res.cookie('session', sessionCookie.cookie, cookieOptions);
        return res.json({ status: true, session: sessionCookie.cookie });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const verifyHandler = async (req, res) => {
    try {
        const verify = await verifyJWT(req.cookies?.session || req.headers.authorization?.split('Bearer ')[1]);
        if (!verify) return errHandler(res, 'verificationFailed');
        return res.json({ status: true, user: verify }); 
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const revokeHandler = async (req, res) => {
    try {
        const JWT =  req.cookies?.session || req.headers.authorization?.split('Bearer ')[1];
        const decodedJWT = decodeJWT(JWT);
        if (!decodedJWT?.sub) return res.json({ status: false, message: 'JWTInvalid'});
        const revokeCookie = await revokeSession(JWT, decodedJWT?.sub);
        res.clearCookie('session'); 
        if (!revokeCookie) return res.json({ status: false });
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const getUserHandler = async (req, res) => {
    try {
        const user = await getUserByUid(req.params?.uid);
        if (!user) return errHandler(res, 'operationError');
        return res.json({ status: true, user });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};