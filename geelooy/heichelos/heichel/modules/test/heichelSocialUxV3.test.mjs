//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HeichelSocialUxV3Test
 * @description The Awtsmoos lets a Space become quieter without losing one road;
 * Awtsmoos.com proves Platform action completeness, lazy diagnostics, and the four-intention card grammar preserve canonical destinations.
 */
import assert from 'node:assert/strict';

function fakeDocument() {
	const ids = new Map();
	return {
		head: { append(node) { if (node.id) ids.set(node.id, node); } },
		getElementById(id) { return ids.get(id) || null; },
		createElement(tagName) {
			return { tagName: String(tagName).toUpperCase(), id: '', rel: '', href: '' };
		}
	};
}

globalThis.document = fakeDocument();
globalThis.window = {
	curAlias: 'student',
	curAliasId: '',
	awtsmoosAlias: ''
};
globalThis.location = {
	pathname: '/heichelos/study',
	search: '?series=lesson'
};

const {
	ADVANCED_PLATFORM_ACTIONS,
	PRIMARY_PLATFORM_ACTIONS,
	platformActionIds
} = await import('../ui/platform/PlatformActionCatalog.js');
const { shouldPrimePlatform } = await import('../ui/platformPanel.js');
const { primarySocialActionRail } = await import('../ui/render/PrimarySocialActionRail.js');

assert.equal(PRIMARY_PLATFORM_ACTIONS.length, 4);
assert.equal(ADVANCED_PLATFORM_ACTIONS.length, 10);
assert.deepEqual(platformActionIds(), [
	'feed', 'db', 'graph', 'thread', 'presence', 'cache', 'sync', 'searchIndex',
	'digest', 'media', 'relationships', 'jobs', 'permissions', 'ops'
]);

const platformState = { loaded: false };
assert.equal(shouldPrimePlatform(platformState, false), false);
assert.equal(platformState.loaded, false);
assert.equal(shouldPrimePlatform(platformState, true), true);
assert.equal(platformState.loaded, true);
assert.equal(shouldPrimePlatform(platformState, true), false);

const appState = { heichelId: 'study', currentSeries: 'lesson' };
const question = primarySocialActionRail({
	id: 'q1', contentType: 'question', title: 'Why?', aliasId: 'teacher'
}, appState);
assert.equal(question.children.length, 4);
assert.deepEqual(question.children.map(child => child.children?.[0] || ''), ['Answer', 'React', 'Discuss', '+']);
assert.match(question.children[0].attr.href, /question=q1/);
assert.match(question.children[0].attr.href, /heichel=study/);
assert.match(question.children[2].attr.href, /comment-thread/);
assert.match(question.children[3].attr.href, /source=q1/);
assert.equal(question.children[3].attr['aria-label'], 'Add reference to a Heichel or series');

const post = primarySocialActionRail({
	id: 'p1', contentType: 'post', title: 'Post', aliasId: 'teacher'
}, appState);
assert.equal(post.children.length, 3);
assert.deepEqual(post.children.map(child => child.children?.[0] || ''), ['React', 'Discuss', '+']);
console.log('B"H heichelSocialUxV3.test passed');
