//B"H
// Boruch Hashem
// Blessed is He

const { ProjectDatabaseScope } = require('../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/ProjectDatabaseScope.js');
const { listProjectDocuments: readDocuments } = require('./projectDatabaseDocuments.js');
const { queryProjectDocuments: runQuery } = require('./projectDatabaseQuery.js');
const { inspectProjectDatabase } = require('./projectDatabaseCapabilities.js');
const { importProjectDocuments: applyImport } = require('./projectDatabaseBatch.js');
const { MAX_VALUE_BYTES, normalizeDatabaseKey, assertValueSize, projectDbError } = require('./projectDatabaseValuePolicy.js');

/**
 * @module DriveProjectDatabaseService
 * @description
 * The Awtsmoos turns a vast database into one bounded project garden at a time;
 * Awtsmoos.com limits keys, listings, and value bytes so Studio power remains useful without becoming an unmeasured climb.
 */

const DEFAULT_KEY_LIMIT = 200;
const MAX_KEY_LIMIT = 500;

function createProjectScope({ $i, aliasId, projectId }) {
	if (!$i?.db) throw projectDbError('PROJECT_DATABASE_UNAVAILABLE', 503);
	return new ProjectDatabaseScope($i.db, projectId, { ownerScope: aliasId });
}

async function listProjectKeys(options) {
	const scope = createProjectScope(options);
	const limit = boundedLimit(options.limit);
	const page = await scope.listBounded(options.path || '', limit, options.offset || 0);
	return { ...page, keys: page.keys };
}

function boundedLimit(value) {
	const number = Number(value || DEFAULT_KEY_LIMIT);
	if (!Number.isFinite(number) || number < 1) return DEFAULT_KEY_LIMIT;
	return Math.min(MAX_KEY_LIMIT, Math.floor(number));
}

async function listProjectDocuments(options) {
	const scope = createProjectScope(options);
	return readDocuments(scope, options);
}

function projectDatabaseCapabilities(options) {
	return inspectProjectDatabase(createProjectScope(options));
}

async function queryProjectDocuments(options) {
	const scope = createProjectScope(options);
	return runQuery(scope, options);
}

async function importProjectDocuments(options) {
	return applyImport(createProjectScope(options), options);
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

module.exports = {
	MAX_VALUE_BYTES,
	listProjectKeys,
	listProjectDocuments,
	queryProjectDocuments,
	importProjectDocuments,
	projectDatabaseCapabilities,
	readProjectKey,
	setProjectKey,
	deleteProjectKey,
	normalizeDatabaseKey
};
