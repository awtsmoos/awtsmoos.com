// B"H

/** @file pruneMirrors.test.js @description Proves raw mirrors require exact SHA parity. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const {
	pruneEmptyLegacyComments,
	pruneMatchingMirrors
} = require('../pruneMirrors.js');

function fixture(content = Buffer.from('B"H exact content')) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-mirrors-'));
	const file = path.join(root, 'family.awtsdb');
	const virtualPath = '/social/heichelos/ikar/series/a/prateem.awtsmoosJSON';
	const raw = path.join(root, virtualPath.replace(/^\//, ''));
	fs.mkdirSync(path.dirname(raw), { recursive: true });
	fs.writeFileSync(raw, content);
	const database = new AwtsmoosDB(file, { wal: false, virtualFsCompression: true });
	database.open();
	database.fs.write(virtualPath, content);
	database.close();
	return { root, file, raw };
}

test('matching raw mirror is removed only after byte equality', () => {
	const current = fixture();
	const dry = pruneMatchingMirrors(current.file, current.root, { dryRun: true });
	assert.equal(dry.refused, false);
	assert.equal(dry.matched.length, 1);
	assert.equal(fs.existsSync(current.raw), true);
	const actual = pruneMatchingMirrors(current.file, current.root);
	assert.equal(actual.removed.length, 1);
	assert.equal(fs.existsSync(current.raw), false);
	fs.rmSync(current.root, { recursive: true, force: true });
});

test('mismatched raw mirror is preserved and blocks pruning', () => {
	const current = fixture();
	fs.writeFileSync(current.raw, 'different');
	const result = pruneMatchingMirrors(current.file, current.root);
	assert.equal(result.refused, true);
	assert.equal(result.mismatched.length, 1);
	assert.equal(fs.existsSync(current.raw), true);
	fs.rmSync(current.root, { recursive: true, force: true });
});

test('legacy comments are pruned only when every file is empty', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-comments-'));
	const comments = path.join(root, 'social/heichelos/ikar/comments/a');
	fs.mkdirSync(comments, { recursive: true });
	fs.writeFileSync(path.join(comments, 'empty.json'), '');
	assert.equal(pruneEmptyLegacyComments(root).removed, true);
	fs.mkdirSync(comments, { recursive: true });
	fs.writeFileSync(path.join(comments, 'content.json'), 'keep');
	assert.equal(pruneEmptyLegacyComments(root).refused, true);
	assert.equal(fs.existsSync(path.join(comments, 'content.json')), true);
	fs.rmSync(root, { recursive: true, force: true });
});
