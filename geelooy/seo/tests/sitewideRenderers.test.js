// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideRenderers.test.js
 * @description
 * The Awtsmoos tests semantic vessels for Heichelos, aliases, authored Torah, comments, translations, and route order beneath the public sky;
 * Awtsmoos.com keeps escaped words visible, stale identities absent, and each public collection named through a truthful searchable road nearby.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { authoredPostUrl, renderAuthoredPosts } = require('../../@/seo/aliasPosts.js');
const { validatedAliasIds } = require('../publicAliasValidity.js');
const { commentPlainText } = require('../../heichelos/routes/heichel/comments/commentText.js');
const { renderCommentHtml } = require('../../heichelos/routes/heichel/comments/commentHtml.js');
const { renderTranslationRow } = require('../../heichelos/routes/heichel/translations/rows.js');
const createRoutes = require('../../heichelos/routes/heichel/createRoutes.js');

async function testAliasValidity() {
	const resolver = async (_$i, aliasId) => aliasId.startsWith('living') ? { id: aliasId } : null;
	assert.deepEqual(await validatedAliasIds({}, ['living', 'stale', 'living-two'], resolver), ['living', 'living-two']);
}

function testHeichelosLandingSemantics() {
	const rootTemplate = fs.readFileSync(path.resolve('geelooy/heichelos/_awtsmoos.index.html'), 'utf8');
	for (const expected of [
		'Heichelos | Awtsmoos',
		'https://awtsmoos.com/heichelos/',
		'name="robots"',
		'name="description"',
		'property="og:title"',
		'name="twitter:title"',
		"'@type': 'CollectionPage'",
		'data-awtsmoos-heichelos-jsonld'
	]) {
		assert.ok(rootTemplate.includes(expected), `missing Heichelos semantic marker: ${expected}`);
	}
	assert.ok(rootTemplate.includes('manifestSemanticHead(pageDocument)'));
}

function testAuthoredPosts() {
	assert.equal(authoredPostUrl({ heichelId: 'ikar', seriesId: 'root', postId: 'p1' }), '/heichelos/ikar/post/p1');
	assert.equal(authoredPostUrl({ heichelId: 'ikar', seriesId: 'series one', postId: 'p 2' }), '/heichelos/ikar/series/series%20one/post/p%202');
	const html = renderAuthoredPosts([{ heichelId: 'ikar', seriesId: 'root', postId: 'p1', title: '<Truth>', heichelName: 'Ikar', excerpt: '<light>' }]);
	assert.ok(html.includes('data-awtsmoos-authored-post'));
	assert.ok(html.includes('/heichelos/ikar/post/p1'));
	assert.ok(html.includes('&lt;Truth&gt;'));
	assert.ok(html.includes('&lt;light&gt;'));
}

function testCommentRendering() {
	const comment = { id: 'c1', heichelId: 'ikar', seriesId: 'series-one', postId: 'p1', aliasId: 'author', content: '<script>alert(1)</script> Main words', audio: { transcript: 'spoken transcript' }, sections: [{ title: 'Section', text: 'section words' }] };
	const text = commentPlainText(comment);
	assert.ok(text.includes('Main words') && text.includes('spoken transcript') && text.includes('section words'));
	const html = renderCommentHtml(comment);
	assert.ok(html.includes('/@/author') && html.includes('/heichelos/ikar/posts/p1/comments/c1'));
	assert.ok(!html.includes('<script>'));
}

function testTranslationAndRoutes() {
	const html = renderTranslationRow({ id: 't1', content: 'English light', sourceHebrew: 'אור' });
	assert.ok(html.includes('lang="en"') && html.includes('lang="he"') && html.includes('English light') && html.includes('אור'));
	const routes = createRoutes({});
	const keys = Object.keys(routes);
	for (const route of ['/:heichel/post/:post', '/:heichel/series/:series/post/:post', '/:heichel/posts/:post/comments/:comment']) {
		assert.equal(typeof routes[route], 'function');
	}
	assert.ok(keys.indexOf('/:heichel/series/:series/post/:post/translations') < keys.indexOf('/:heichel/series/:series/post/:post'));
}

Promise.resolve()
	.then(testAliasValidity)
	.then(testHeichelosLandingSemantics)
	.then(testAuthoredPosts)
	.then(testCommentRendering)
	.then(testTranslationAndRoutes)
	.then(() => console.log('SITEWIDE_RENDERER_REGRESSION_PASS'));
