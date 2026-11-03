// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file postsByAliasBackfill.test.js
 * @description
 * The Awtsmoos proves that a historical sea may be streamed into staged alias vessels and activated only under unchanged testimony;
 * Awtsmoos.com rejects stale stages rather than pretending a raced backfill is complete.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { fileFor } = require('../socialPackedEngine.js');
const {
	bucketFileForDirectory,
	journalActive,
	journalDirectory,
	manifestFile
} = require('../postsByAliasJournalPath.js');
const { readAliasJournalCandidates } = require('../postsByAliasJournalRead.js');
const { buildJournal } = require('../scripts/backfillPostsByAliasJournal.js');
const { activateJournal } = require('../scripts/activatePostsByAliasJournal.js');

function tempRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awts-alias-backfill-'));
}

function record(alias, post, heichel, ts) {
	return JSON.stringify({
		op: 'put',
		key: `/indexes/postsByAlias/${alias}/${post}`,
		value: { aliasId: alias, postId: post, heichelId: heichel },
		meta: { index: 'postsByAlias' },
		ts
	});
}

function seed(root) {
	const source = fileFor(root, 'search');
	fs.mkdirSync(path.dirname(source), { recursive: true });
	fs.writeFileSync(source, [
		record('a', 'old', 'h', 1),
		JSON.stringify({ op: 'put', key: '/not-an-alias-index', value: { x: 1 }, meta: {} }),
		'{"key":"/indexes/postsByAlias/a/bad",BROKEN',
		record('b', 'other', 'h2', 2),
		record('a', 'new', 'h', 3)
	].join('\n') + '\n');
	return source;
}

test('backfill stages bounded buckets and activation publishes one stable journal', async () => {
	const root = tempRoot();
	seed(root);
	const $i = { db: { directory: root } };
	const stage = `${journalDirectory($i)}.staging-test`;
	const result = await buildJournal(root, stage);
	assert.equal(result.manifest.stable, true);
	assert.equal(result.manifest.records, 3);
	assert.equal(result.manifest.malformed, 1);
	assert.equal(result.manifest.active, false);
	const candidates = await readAliasJournalCandidates({
		aliasId: 'a',
		limit: 5,
		fileOverride: bucketFileForDirectory(stage, 'a')
	});
	assert.deepEqual(candidates.map(item => item.p), ['new', 'old']);
	const activated = activateJournal(root, stage);
	assert.equal(activated.manifest.active, true);
	assert.equal(journalActive($i), true);
	assert.equal(JSON.parse(fs.readFileSync(manifestFile($i))).active, true);
});

test('activation refuses a stage after its source changes', async () => {
	const root = tempRoot();
	const source = seed(root);
	const $i = { db: { directory: root } };
	const stage = `${journalDirectory($i)}.staging-race`;
	await buildJournal(root, stage);
	fs.appendFileSync(source, record('a', 'late', 'h', 4) + '\n');
	assert.throws(() => activateJournal(root, stage), /SOURCE_CHANGED_AFTER_BACKFILL/);
	assert.equal(fs.existsSync(journalDirectory($i)), false);
	assert.equal(fs.existsSync(stage), true);
});
