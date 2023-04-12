import { insertObject, deleteObject, listObjects, updateObject, setObject, getObject } from './operations.js';
import { errHandler } from '../utilities/handlers.js';

export const insertHandler = async (req, res) => {
    try {
        const operation = await insertObject(res.collection, req.params.id, req.body?.object);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const listHandler = async (req, res) => {
    try {
        let operation = await listObjects(res.collection, req.query.filter, req.query.value);
        if (!operation) return errHandler(res, 'operationError');
        if (res.filter) operation = operation.filter(item => item[`${res.filter?.lookup}`] === res.filter?.match);
        return res.json({ status: true, list: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const updateHandler = async (req, res) => {
    try {
        const operation = await updateObject(res.collection, req.params.id, req.body?.object);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const setHandler = async (req, res) => {
    try {
        const operation = await setObject(res.collection, req.params.id, req.body?.object, req.query.merge);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const deleteHandler = async (req, res) => {
    try {
        const operation = await deleteObject(res.collection, req.params.id);
        if (!operation) return errHandler(res, 'operationError');
        return res.json({ status: true });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};

export const getHandler = async (req, res) => {
    try {
        const operation = await getObject(res.collection, req.params.id);
        if (!operation) return errHandler(res, 'operationError');
        if (res.filter && operation[`${res.filter.lookup}`] !== res.filter.match) return errHandler(res, 'operationFailed');
        return res.json({ status: true, object: operation });
    } catch (e) {
        console.error(e);
        return errHandler(res);
    }
};