// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sitewideRenderers.test.js
 * @description
 * The Awtsmoos tests the semantic vessels themselves: comments, translations, aliases, and route order beneath the public sky;
 * Awtsmoos.com keeps escaped words visible, stale aliases absent, and specific SEO doors ahead of generic routes as generations pass by.
 */

const assert = require('node:assert/strict');
const { validatedAliasIds } = require('../publicAliasValidity.js');
const { commentPlainText } = require('../../heichelos/routes/heichel/comments/commentText.js');
const { renderCommentHtml } = require('../../heichelos/routes/heichel/comments/commentHtml.js');
const { renderTranslationRow } = require('../../heichelos/routes/heichel/translations/rows.js');
const createRoutes = require('../../heichelos/routes/heichel/createRoutes.js');

async function testAliasValidity() {
	const candidates = ['living', 'stale', 'living-two'];
	const resolver = async (_$i, aliasId) => aliasId.startsWith('living') ? { id: aliasId } : null;
	const validated = await validatedAliasIds({}, candidates, resolver);
	assert.deepEqual(validated, ['living', 'living-two']);
}

function testCommentRendering() {
	const comment = {
		id: 'c1',
		heichelId: 'ikar',
		seriesId: 'series-one',
		postId: 'p1',
		aliasId: 'author',
		content: '<script>alert(1)</script> Main words',
		audio: { transcript: 'spoken transcript' },
		sections: [{ title: 'Section', text: 'section words' }]
	};
	const text = commentPlainText(comment);
	assert.ok(text.includes('Main words'));
	assert.ok(text.includes('spoken transcript'));
	assert.ok(text.includes('section words'));
	const html = renderCommentHtml(comment);
	assert.ok(html.includes('/@/author'));
	assert.ok(html.includes('/heichelos/ikar/posts/p1/comments/c1'));
	assert.ok(!html.includes('<script>'));
}

function testTranslationRendering() {
	const html = renderTranslationRow({ id: 't1', content: 'English light', sourceHebrew: 'אור' });
	assert.ok(html.includes('lang="en"'));
	assert.ok(html.includes('lang="he"'));
	assert.ok(html.includes('English light'));
	assert.ok(html.includes('אור'));
}

function testRouteOrder() {
	const routes = createRoutes({});
	const keys = Object.keys(routes);
	const translation = '/:heichel/series/:series/post/:post/translations';
	const post = '/:heichel/series/:series/post/:post';
	assert.ok(keys.includes('/:heichel/posts/:post/comments/:comment'));
	assert.ok(keys.indexOf(translation) < keys.indexOf(post));
}

Promise.resolve()
	.then(testAliasValidity)
	.then(testCommentRendering)
	.then(testTranslationRendering)
	.then(testRouteOrder)
	.then(() => console.log('SITEWIDE_RENDERER_REGRESSION_PASS'));
