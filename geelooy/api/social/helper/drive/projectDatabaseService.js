//B"H
// Boruch Hashem
// Blessed is He

const { ProjectDatabaseScope } = require('../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/ProjectDatabaseScope.js');

/**
 * @module DriveProjectDatabaseService
 * @description
 * The Awtsmoos turns a vast database into one bounded project garden at a time;
 * Awtsmoos.com limits keys, listings, and value bytes so Studio power remains useful without becoming an unmeasured climb.
 */

const DEFAULT_KEY_LIMIT = 200;
const MAX_KEY_LIMIT = 500;
const MAX_VALUE_BYTES = 262144;

function createProjectScope({ $i, aliasId, projectId }) {
	if (!$i?.db) throw projectDbError('PROJECT_DATABASE_UNAVAILABLE', 503);
	return new ProjectDatabaseScope($i.db, projectId, { ownerScope: aliasId });
}

async function listProjectKeys(options) {
	const scope = createProjectScope(options);
	const keys = await scope.list(options.path || '');
	const list = Array.isArray(keys) ? keys : Object.keys(keys || {});
	const limit = boundedLimit(options.limit);
	return { keys: list.slice(0, limit), truncated: list.length > limit, total: list.length };
}

async function readProjectKey(options) {
	const scope = createProjectScope(options);
	const key = normalizeDatabaseKey(options.key);
	const value = await scope.getKey(options.path || '', key);
	assertValueSize(value, 'PROJECT_DB_VALUE_TOO_LARGE_TO_READ');
	return { key, value };
}

async function setProjectKey(options) {
	const scope = createProjectScope(options);
	const key = normalizeDatabaseKey(options.key);
	assertValueSize(options.value, 'PROJECT_DB_VALUE_TOO_LARGE');
	await scope.setKey(options.path || '', key, options.value);
	return { key, written: true };
}

async function deleteProjectKey(options) {
	const scope = createProjectScope(options);
	const key = normalizeDatabaseKey(options.key);
	await scope.deleteKey(options.path || '', key);
	return { key, deleted: true };
}

function normalizeDatabaseKey(value) {
	const key = String(value || '').trim();
	if (!key || key.length > 160 || key === '.' || key === '..' || /[\\/\0]/.test(key)) {
		throw projectDbError('INVALID_PROJECT_DB_KEY', 400);
	}
	return key;
}

function boundedLimit(value) {
	const number = Number(value || DEFAULT_KEY_LIMIT);
	if (!Number.isFinite(number) || number < 1) return DEFAULT_KEY_LIMIT;
	return Math.min(MAX_KEY_LIMIT, Math.floor(number));
}

function assertValueSize(value, code) {
	const bytes = Buffer.byteLength(JSON.stringify(value === undefined ? null : value), 'utf8');
	if (bytes > MAX_VALUE_BYTES) throw projectDbError(code, 413);
}

function projectDbError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	MAX_VALUE_BYTES,
	listProjectKeys,
	readProjectKey,
	setProjectKey,
	deleteProjectKey,
	normalizeDatabaseKey
};
