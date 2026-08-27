// B"H

/**
 * @file runtimePathResolution.test.js
 * @description
 * Proves canonical data stays isolated while existing rebuildable AI storage is
 * discovered without creation, mutation, or machine-specific hard-coding.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	aiRoot,
	ragRoot,
	runtimeAiCandidates
} = require('../paths.js');

function withEnvironment(values, task) {
	const previous = {};
	for (const [key, value] of Object.entries(values)) {
		previous[key] = process.env[key];
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
	try {
		return task();
	} finally {
		for (const [key, value] of Object.entries(previous)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
	}
}

function fixture() {
	const documents = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-documents-'));
	const database = path.join(documents, 'awtsmoos', 'dayuhChadash');
	const runtime = path.join(documents, 'dayuhChadash-runtime', 'ai');
	fs.mkdirSync(database, { recursive: true });
	return { context: { db: { directory: database } }, database, documents, runtime };
}

test('discovers an existing Documents-level runtime root', () => {
	const value = fixture();
	fs.mkdirSync(value.runtime, { recursive: true });
	withEnvironment({ AWTSMOOS_AI_ROOT: undefined, AWTSMOOS_RAG_ROOT: undefined }, () => {
		assert(runtimeAiCandidates(value.context).includes(value.runtime));
		assert.equal(aiRoot(value.context), value.runtime);
		assert.equal(ragRoot(value.context), path.join(value.runtime, 'comment-rag'));
	});
	fs.rmSync(value.documents, { recursive: true, force: true });
});

test('falls back inside an isolated database root when no runtime exists', () => {
	const value = fixture();
	withEnvironment({ AWTSMOOS_AI_ROOT: undefined, AWTSMOOS_RAG_ROOT: undefined }, () => {
		assert.equal(aiRoot(value.context), path.join(value.database, 'ai'));
	});
	fs.rmSync(value.documents, { recursive: true, force: true });
});

test('preserves explicit AI and RAG environment overrides', () => {
	const value = fixture();
	const explicitAi = path.join(value.documents, 'explicit-ai');
	const explicitRag = path.join(value.documents, 'explicit-rag');
	withEnvironment({ AWTSMOOS_AI_ROOT: explicitAi, AWTSMOOS_RAG_ROOT: explicitRag }, () => {
		assert.equal(aiRoot(value.context), explicitAi);
		assert.equal(ragRoot(value.context), explicitRag);
	});
	fs.rmSync(value.documents, { recursive: true, force: true });
});
