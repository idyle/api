import { decodeJWT, generateSession, getUserByEmail, getUserByUid, revokeSession, setUserClaims, verifyJWT } from './operations.js';
import { errHandler } from '../utilities/handlers.js';

export const generateHandler = async (req, res) => {
    try {
        const sessionCookie = await generateSession(req.headers.authorization?.split('Bearer ')[1]);
        if (!sessionCookie) return errHandler(res, 'operationError');
        const cookieOptions = { maxAge: sessionCookie.expiry.expiresIn, httpOnly: true, secure: true };
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
        if (!decodedJWT?.sub) return errHandler(res, 'The token is invalid.');
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
        let user = req.params?.uid;
        if (req.query.type === 'email') user = await getUserByEmail(user);
        else user = await getUserByUid(user);
        if (!user) return errHandler(res, 'operationError');
        return res.json({ status: true, user });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const setUserHandler = async (req, res) => {
    try {
        let user = req.params?.uid;
        if (req.query.type === 'email') user = await getUserByEmail(user);
        else user = await getUserByUid(user);
        if (!user) return errHandler(res, 'Could not get user.');
        const operation = await setUserClaims(user?.uid, req.body?.claims);
        if (!operation) return errHandler(res, 'Could not set user data.');
        return res.json({ status: true, user });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    };
};