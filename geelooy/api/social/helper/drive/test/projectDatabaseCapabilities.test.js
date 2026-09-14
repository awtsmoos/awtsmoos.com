//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file Project Database capability testimony tests.
 * @description
 * The Awtsmoos proves Studio badges reflect actual runtime methods and never upgrade
 * a plain DosDB-compatible vessel into native AwtsmoosDB through naming alone.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { inspectProjectDatabase } = require('../projectDatabaseCapabilities.js');

/** @param {object} database Backing database candidate. @returns {object} Scope vessel. */
function scope(database) {
	return { database };
}

test('plain DosDB-compatible runtime stays compatibility mode', () => {
	const database = {
		get() {},
		read() {},
		write() {},
		getObjectKeys() {}
	};
	const result = inspectProjectDatabase(scope(database));
	assert.equal(result.mode, 'dosdb-compatible');
	assert.equal(result.engine, 'DosDB-compatible');
	assert.equal(result.features.query, false);
	assert.equal(result.nativeFeatureCount, 0);
});

test('native-shaped AwtsmoosDB advertises only methods that exist', () => {
	class AwtsmoosDB {}
	const database = new AwtsmoosDB();
	database.query = () => [];
	database.indexes = { create() {}, find() {}, list() {} };
	database.search = { enable() {}, run() {} };
	database.vector = { enable() {}, nearest() {} };
	database.backup = () => ({});
	database.sql = () => [];
	database.mongo = {};
	const result = inspectProjectDatabase(scope(database));
	assert.equal(result.engine, 'AwtsmoosDB');
	assert.equal(result.mode, 'native-awtsmoosdb');
	assert.equal(result.features.vector, true);
	assert.equal(result.features.graphql, false);
	assert.equal(result.features.mongo, true);
	assert.equal(result.features.firebase, false);
});

test('capability testimony never leaks arbitrary constructor text', () => {
	const database = Object.create({ constructor: { name: '../secret/path' } });
	const result = inspectProjectDatabase(scope(database));
	assert.equal(result.engine, 'DosDB-compatible');
});
