import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { decode } from 'jsonwebtoken';

/**
 * Initializes the firebase object using Application Default Credentials (ADC)
 * {@link https://cloud.google.com/docs/authentication/production}
 * In development environments, specify the path of a service account
 * via the @param GOOGLE_APPLICATION_CREDENTIALS variable 
 */

initializeApp(); // using ADC

const project = process.env.PROJECT;

/**
 * Decodes a JWT and returns the decoded claims.
 * @param {String} jwt the JWT in the form of a string.
 * @returns {Promise} the decoded claims in the form of an object.
*/

export const decodeJWT = (jwt = '') => decode(jwt);

/**
 * Verifies a client-side JWT and returns a decoded object of the token.
 * @param {string} token the client-side JWT in the form of a string.
 * @returns {Promise} the decoded claims of the token in the form of an object.
 */

export const verifyToken = async (token = '') => {
    try {
        if (!token) return false;
        const decodedToken = await getAuth().verifyIdToken(token, true);
        if (!decodedToken) return false;
        return decodedToken;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const verifyJWT = async (JWT = '') => {
    try {
        let verification = false;
        const decodedJWT = decode(JWT);
        if (decodedJWT?.iss === `https://securetoken.google.com/${project}`) verification = await verifyToken(JWT);
        else if (decodedJWT?.iss === `https://session.firebase.google.com/${project}`) verification = await verifySession(JWT);
        return verification;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Generates a server-side JWT from the client-side JWT and returns a JWT object.
 * @param {string} token the client-side JWT in the form of a string.
 * @returns {Promise} the server-side JWT in the form of an object.
 */

export const generateSession = async (token = '') => {
    try {
        const expiry = { expiresIn: 60 * 60 * 24 * 14 * 1000 };
        const decodedToken = await verifyToken(token);
        if (!decodedToken) return false;
        if (!(new Date().getTime() / 1000 - decodedToken.iat < 5 * 60)) return false;
        return { expiry, cookie: await getAuth().createSessionCookie(token, expiry) }
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Verifies a server-side JWT and returns a boolean.
 * @param {String} session the server-side JWT in the form of a string.
 * @param {String} type the type of the verification in the form of a string.
 * @returns {Promise} the decoded claims of the session in the form of an object.
 */

export const verifySession = async (session = '') => {
    try {
        if (!session) return false;
        const decodedClaims = await getAuth().verifySessionCookie(session, true);
        if (!decodedClaims) return false;
        return decodedClaims;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Revokes a server-side JWT and returns a boolean.
 * @param {string} session the server-side JWT in the form of a string.
 * @returns {Promise} the status of the revocation in the form of a boolean.
 */

export const revokeSession = async (session = '', uid = '') => {
    try {
        if (!session || !uid) return false;
        await getAuth().revokeRefreshTokens(uid);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const getUserByUid = async (uid = '') => {
    try {
        if (!uid) return false;
        const user = await getAuth().getUser(uid);
        if (!user || user?.error) return false;
        return { uid: user?.uid, email: user?.email, name: user?.displayName, ...user?.customClaims }; 
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const setUserClaims = async (uid = '', claims = {}) => {
    try {
        if (!uid || !claims) return false;
        await getAuth().setCustomUserClaims(uid, claims);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const getUserByEmail = async (email = '') => {
    if (!email) return false;
    try {
        const user = await getAuth().getUserByEmail(email);
        if (!user || user?.error) return false;
        return { uid: user?.uid, email: user?.email, name: user?.displayName, ...user?.customClaims }; 
    } catch (e) {
        console.error(e);
        return false;
    }
};