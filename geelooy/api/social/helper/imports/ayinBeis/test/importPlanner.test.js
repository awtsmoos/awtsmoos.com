// B"H
/**
 * Boruch Hashem. Blessed is He.
 *
 * @file importPlanner.test.js
 * @description
 * The Awtsmoos sees every correspondence; Awtsmoos.com must still prove the
 * match. These tests keep explicit identity above fuzzy resemblance and turn
 * ambiguity into a blocker rather than a silent rewrite.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { contentHash, normalizeTitle } = require('../authorizedBundle.js');
const { buildImportPlan, classifyRecord, titleIndex } = require('../importPlanner.js');

function record(overrides = {}) {
	const content = overrides.content ?? 'תוכן חדש';
	return {
		sourceId: overrides.sourceId || 'source-1',
		targetPostId: overrides.targetPostId || '',
		seriesId: overrides.seriesId || 'ayinBeisVolume1',
		title: overrides.title || 'בס״ד מאמר',
		content,
		contentHash: contentHash(content)
	};
}

test('explicit IDs win and empty destinations become fill-empty', () => {
	const posts = { post1: { id: 'post1', title: 'שם אחר', content: '' } };
	const result = classifyRecord(record({ targetPostId: 'post1' }), posts, titleIndex(posts), false);
	assert.equal(result.action, 'fill-empty');
	assert.equal(result.targetPostId, 'post1');
});

test('unique normalized Hebrew titles match punctuation and whitespace variants', () => {
	const posts = { post1: { id: 'post1', title: 'בס"ד   מאמר', content: '' } };
	const source = record({ title: 'בס״ד מאמר' });
	assert.equal(normalizeTitle(source.title), normalizeTitle(posts.post1.title));
	const result = classifyRecord(source, posts, titleIndex(posts), false);
	assert.equal(result.action, 'fill-empty');
	assert.equal(result.targetPostId, 'post1');
});

test('identical content is unchanged and differing nonempty content is guarded', () => {
	const same = 'אותו תוכן';
	const posts = { post1: { id: 'post1', title: 'מאמר', content: same } };
	assert.equal(classifyRecord(record({ title: 'מאמר', content: same }), posts, titleIndex(posts), false).action, 'unchanged');
	assert.equal(classifyRecord(record({ title: 'מאמר', content: 'חדש' }), posts, titleIndex(posts), false).action, 'conflict-nonempty');
	assert.equal(classifyRecord(record({ title: 'מאמר', content: 'חדש' }), posts, titleIndex(posts), true).action, 'replace');
});

test('ambiguous and missing titles fail closed', () => {
	const posts = {
		one: { title: 'אותו שם', content: '' },
		two: { title: 'אותו שם', content: '' }
	};
	assert.equal(classifyRecord(record({ title: 'אותו שם' }), posts, titleIndex(posts), false).action, 'conflict-ambiguous');
	assert.equal(classifyRecord(record({ title: 'לא קיים' }), posts, titleIndex(posts), false).action, 'missing-target');
});

test('buildImportPlan counts blockers deterministically', async () => {
	const db = {
		async get() {
			return {
				post1: { id: 'post1', title: 'א', content: '' },
				post2: { id: 'post2', title: 'ב', content: 'קיים' }
			};
		}
	};
	const bundle = {
		records: [record({ sourceId: 'a', title: 'א' }), record({ sourceId: 'b', title: 'ב', content: 'שונה' })]
	};
	const plan = await buildImportPlan({ db, bundle });
	assert.equal(plan.counts['fill-empty'], 1);
	assert.equal(plan.counts['conflict-nonempty'], 1);
	assert.equal(plan.blockers.length, 1);
});
