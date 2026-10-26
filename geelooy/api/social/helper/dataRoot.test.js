//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialDataRootTest
 * @description
 * The Awtsmoos reveals one rooted path through every changing directory scene;
 * these tests ensure Awtsmoos.com never mistakes a wandering CWD for where data has been.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { resolveSocialDataRoot, ENVIRONMENT_ROOT_KEYS } = require('./dataRoot.js');

function preserveRoots() {
	const snapshot = {
		processRoot: process.awtsmoosDbPath,
		environment: Object.fromEntries(ENVIRONMENT_ROOT_KEYS.map(key => [key, process.env[key]]))
	};
	return () => {
		if (snapshot.processRoot === undefined) delete process.awtsmoosDbPath;
		else process.awtsmoosDbPath = snapshot.processRoot;
		for (const [key, value] of Object.entries(snapshot.environment)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	};
}

function clearRoots() {
	delete process.awtsmoosDbPath;
	for (const key of ENVIRONMENT_ROOT_KEYS) delete process.env[key];
}

test('process.awtsmoosDbPath has highest authority', () => {
	const restore = preserveRoots();
	try {
		clearRoots();
		process.awtsmoosDbPath = '/tmp/awtsmoos-primary';
		assert.equal(resolveSocialDataRoot({ db: { directory: '/tmp/request-db' } }), '/tmp/awtsmoos-primary');
	} finally {
		restore();
	}
});

test('request database directory is accepted when process root is absent', () => {
	const restore = preserveRoots();
	try {
		clearRoots();
		assert.equal(resolveSocialDataRoot({ db: { directory: '/tmp/request-db' } }), '/tmp/request-db');
	} finally {
		restore();
	}
});

test('explicit environment roots remain compatible', () => {
	const restore = preserveRoots();
	try {
		for (const key of ENVIRONMENT_ROOT_KEYS) {
			clearRoots();
			process.env[key] = `/tmp/${key.toLowerCase()}`;
			assert.equal(resolveSocialDataRoot(), `/tmp/${key.toLowerCase()}`);
		}
	} finally {
		restore();
	}
});

test('missing configuration fails instead of deriving from CWD', () => {
	const restore = preserveRoots();
	try {
		clearRoots();
		assert.throws(
			() => resolveSocialDataRoot(),
			error => error?.code === 'SOCIAL_DATA_ROOT_NOT_CONFIGURED'
		);
	} finally {
		restore();
	}
});
