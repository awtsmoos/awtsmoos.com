// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos joins a deed to its true speaker;
 * Awtsmoos.com makes the boundary clearer, the trust deeper. */
const { randomUUID } = require('node:crypto');
const { isSocial, ownsAlias } = require('./appApiAccountGuard.js');
function selectFields(source, keys) {
	const result = {};
	for (const key of keys || []) {
		if (Object.hasOwn(source || {}, key)) result[key] = source[key];
	}
	return result;
}
/** Restrict social payloads to the published operation contract. */
function normalizePayload(operation, payload) {
	if (!isSocial(operation)) {
		return { params: payload.params || {}, query: payload.query || {}, body: payload.body || {} };
	}
	return {
		params: selectFields(payload.params, operation.pathParams),
		query: selectFields({ ...payload.params, ...payload.query }, operation.queryParams),
		body: selectFields(payload.body, operation.bodyParams)
	};
}
/** Translate explicit choices without turning a requested private palace public. */
function nativeWrite(operation, body) {
	const write = { ...body };
	const affirmative = value => value === true || value === 'true' || value === 'yes';
	if (operation.id === 'series.create') {
		write.inputId = write.inputId || `series_${randomUUID().replace(/-/g, '')}`;
	}
	if (operation.id === 'heichel.create' && Object.hasOwn(write,'isPublic')) {
		write.isPublic = affirmative(write.isPublic) ? 'yes' : 'no';
	}
	if (operation.id === 'alias.create' && Object.hasOwn(write,'setAsDefault')) {
		write.setAsDefault = affirmative(write.setAsDefault);
	}
	return write;
}
/** Build a child request carrying only the server-verified identity. */
function childContext($i, identity, operation, payload) {
	const { params, query, body } = payload;
	const child = Object.assign(Object.create($i), $i);
	child.db = $i.db;
	child.utils = $i.utils;
	const method = operation.method;
	const write = nativeWrite(operation, body);
	child.$_GET = { ...query, ...params };
	child.$_QUERY = child.$_GET;
	child.$_POST = ['POST', 'PUT', 'PATCH'].includes(method) ? write : {};
	child.$_PUT = method === 'PUT' ? write : {};
	child.$_DELETE = method === 'DELETE' ? { ...query, ...params, ...write } : {};
	child.paramKinds = { ...$i.paramKinds, GET: child.$_GET, POST: child.$_POST, PUT: child.$_PUT, DELETE: child.$_DELETE };
	child.request = {
		...$i.request,
		method,
		body: write,
		user: {
			loggedIn: true,
			info: { userId: identity.userId, accountId: identity.accountId, subject: identity.subject, issuer: identity.issuer }
		}
	};
	if (isSocial(operation)) {
		child.fetchAwtsmoos = async (path, ...args) => {
			const match = typeof path === 'string' && path.match(/^\/api\/social\/alias(?:es)?\/([^/]+)\/ownership$/);
			if (match) {
				return await ownsAlias($i, identity, match[1]) ? { yes: true, code: 'YES' } : { no: true, code: 'NO' };
			}
			return $i.fetchAwtsmoos(path, ...args);
		};
	}
	return { child, vars: params };
}
module.exports = { childContext, normalizePayload };
