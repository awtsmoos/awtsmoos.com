// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file importWriter.test.js
 * @description
 * The Awtsmoos is revealed through fidelity after the write, not merely intent
 * before it. These tests prove Awtsmoos.com can preserve a long Hebrew body,
 * mirror it, back it up, and re-read the exact hash without truncation.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { contentHash } = require('../authorizedBundle.js');
const { buildImportPlan } = require('../importPlanner.js');
const { applyImportPlan } = require('../importWriter.js');

function fakeDb(initialPosts) {
	let posts = structuredClone(initialPosts);
	return {
		async get() {
			return structuredClone(posts);
		},
		async updateEntry(_path, { key, value }) {
			posts[key] = structuredClone(value);
			return true;
		},
		snapshot() {
			return structuredClone(posts);
		}
	};
}

test('writes and verifies a long fill-empty body with provenance and backup', async () => {
	const longContent = 'אמת ואמונה '.repeat(2400);
	const db = fakeDb({
		post1: {
			id: 'post1',
			postId: 'post1',
			seriesId: 'ayinBeisVolume1',
			parentSeriesId: 'ayinBeisVolume1',
			title: 'מאמר נסיון',
			content: '',
			dayuh: { existing: true }
		}
	});
	const bundle = {
		records: [{
			sourceId: 'authorized-source-1',
			targetPostId: 'post1',
			seriesId: 'ayinBeisVolume1',
			title: 'מאמר נסיון',
			content: longContent,
			contentHash: contentHash(longContent)
		}]
	};
	const plan = await buildImportPlan({ db, bundle });
	const mirrored = [];
	const backupDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ayin-backup-'));
	const result = await applyImportPlan({
		db,
		plan,
		provenance: {
			sourceName: 'Authorized synthetic fixture',
			sourceUrl: 'fixture://authorized',
			authorizationBasis: 'Synthetic test data created for this test.'
		},
		backupDir,
		mirrorPost: async ({ post }) => mirrored.push(structuredClone(post))
	});
	assert.equal(result.written, 1);
	assert.equal(result.verified, 1);
	assert.equal(mirrored.length, 1);
	assert.ok(fs.existsSync(result.backupFile));
	const stored = db.snapshot().post1;
	assert.equal(stored.content, longContent);
	assert.equal(contentHash(stored.content), bundle.records[0].contentHash);
	assert.equal(stored.dayuh.existing, true);
	assert.equal(stored.dayuh.importProvenance.sourceId, 'authorized-source-1');
	assert.ok(stored.content.length > 15784);
});

test('a second plan becomes unchanged after a verified write', async () => {
	const content = 'תוכן מורשה';
	const db = fakeDb({ post1: { id: 'post1', title: 'כותרת', content: '' } });
	const bundle = {
		records: [{
			sourceId: 'once',
			targetPostId: 'post1',
			seriesId: 'ayinBeisVolume1',
			title: 'כותרת',
			content,
			contentHash: contentHash(content)
		}]
	};
	const first = await buildImportPlan({ db, bundle });
	await applyImportPlan({
		db,
		plan: first,
		provenance: { sourceName: 'Fixture', authorizationBasis: 'Synthetic.' },
		backupDir: fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ayin-idempotent-')),
		mirrorPost: async () => {}
	});
	const second = await buildImportPlan({ db, bundle });
	assert.equal(second.items[0].action, 'unchanged');
	assert.equal(second.blockers.length, 0);
});
