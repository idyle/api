import { Firestore } from '@google-cloud/firestore';

/**
 * Initializes the firebase object using Application Default Credentials (ADC)
 * {@link https://cloud.google.com/docs/authentication/production}
 * In development environments, specify the path of a service account
 * via the @param GOOGLE_APPLICATION_CREDENTIALS variable 
 */

const firestore = new Firestore();

/**
 * Inserts an object to a collection and returns a boolean.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} identifier the document identifier in the form of a string.
 * @param {Object} object the object entry in the form of an object.
 * @returns {Promise} the status of the operation in the form of a boolean.
 */

export const insertObject = async (collection = '', identifier = '', object = {}) => {
    try {
        if (!collection || !identifier || !object) return false;
        const operation = await firestore.collection(collection).doc(identifier).create(object);
        if (operation) return operation;
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Deletes an object from a collection and returns a boolean.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} identifier the document identifier in the form of a string.
 * @returns {Promise} the status of the operation in the form of a boolean.
 */

export const deleteObject = async (collection = '', identifier = '') => {
    try {
        if (!collection || !identifier) return false;
        const operation = await firestore.collection(collection).doc(identifier).delete();
        if (operation) return operation;
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Updates an object in a collection and returns a boolean.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} identifier the document identifier in the form of a string.
 * @param {Object} editObject the updated object entry in the form of an object.
 * @returns {Promise} the status of the operation in the form of a boolean.
 */

export const updateObject = async (collection = '', identifier = '', object = {}) => {
    try {
        if (!collection || !identifier || !object) return false;
        const operation = await firestore.collection(collection).doc(identifier).update(object);
        if (operation) return operation;
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Sets an object in a collection and returns a boolean.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} identifier the document identifier in the form of a string.
 * @param {Object} object the document details in the form of an object.
 * @param {Boolean} merge the option to merge details in the form of a boolean.
 * @returns {Promise} the status of the operation in the form of a boolean.
 */

export const setObject = async (collection = '', identifier = '', object = {}, merge = false) => {
    try {
        if (!collection || !identifier) return false;
        const operation = await firestore.collection(collection).doc(identifier).set(object, { merge });
        if (operation) return operation;
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Gets an object in a collection and returns the object.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} identifier the document identifier in the form of a string.
 * @returns {Promise} the document in the form of an object.
 */

export const getObject = async (collection = '', identifier = '') => {
    try {
        if (!collection || !identifier) return false;
        const operation = await firestore.collection(collection).doc(identifier).get();
        if (operation.exists) return { id: operation.id, ...operation.data()};
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};

/**
 * Lists the objects in a collection and returns a list.
 * @param {String} collection the collection name in the form of a string.
 * @param {String} filter OPTIONAL: the reference in the form of a string.
 * @param {String} value OPTIONAL: the value to check against in the form of a string.
 * @returns {Promise} the list of objects in the form of an Array.
 */

export const listObjects = async (collection = '', filter = '', value = '') => {
    try {
        if (!collection) return false;
        let query, objects = [];
        if (filter && value) query = await firestore.collection(collection).where(filter, "==", value).get();
        else query = await firestore.collection(collection).get();
        for (const object of query.docs) objects.push({ id: object.id, ...object.data() });
        if (objects.length) return objects;
        return false;
    } catch (e) {
        console.error(e);
        return false;
    }
};