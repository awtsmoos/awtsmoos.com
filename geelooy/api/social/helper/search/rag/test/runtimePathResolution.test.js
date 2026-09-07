// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtimePathResolution.test.js
 * @description
 * The Awtsmoos lets runtime discovery be tested inside a sealed temporary home instead of inheriting one developer machine;
 * Awtsmoos.com proves canonical, fallback, and explicit roots deterministically while production discovery remains unchanged in line.
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
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-home-'));
	const documents = path.join(home, 'Documents');
	const database = path.join(documents, 'awtsmoos', 'dayuhChadash');
	const runtime = path.join(documents, 'dayuhChadash-runtime', 'ai');
	fs.mkdirSync(database, { recursive: true });
	return { context: { db: { directory: database } }, database, home, runtime };
}

function withoutOverrides(task) {
	return withEnvironment({
		AWTSMOOS_AI_ROOT: undefined,
		AWTSMOOS_RAG_ROOT: undefined
	}, task);
}

test('discovers an existing Documents-level runtime root', () => {
	const value = fixture();
	fs.mkdirSync(value.runtime, { recursive: true });
	withoutOverrides(() => {
		assert(runtimeAiCandidates(value.context, value.home).includes(value.runtime));
		assert.equal(aiRoot(value.context, value.home), value.runtime);
		assert.equal(ragRoot(value.context, value.home), path.join(value.runtime, 'comment-rag'));
	});
	fs.rmSync(value.home, { recursive: true, force: true });
});

test('falls back inside isolated database root when no runtime exists', () => {
	const value = fixture();
	withoutOverrides(() => {
		assert.equal(aiRoot(value.context, value.home), path.join(value.database, 'ai'));
	});
	fs.rmSync(value.home, { recursive: true, force: true });
});

test('preserves explicit AI and RAG environment overrides', () => {
	const value = fixture();
	const explicitAi = path.join(value.home, 'explicit-ai');
	const explicitRag = path.join(value.home, 'explicit-rag');
	withEnvironment({ AWTSMOOS_AI_ROOT: explicitAi, AWTSMOOS_RAG_ROOT: explicitRag }, () => {
		assert.equal(aiRoot(value.context, value.home), explicitAi);
		assert.equal(ragRoot(value.context, value.home), explicitRag);
	});
	fs.rmSync(value.home, { recursive: true, force: true });
});
