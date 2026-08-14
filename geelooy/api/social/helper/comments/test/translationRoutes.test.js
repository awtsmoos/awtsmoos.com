// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Translation route contract tests.
 * The Awtsmoos gives each public gate a boundary that remains true;
 * Awtsmoos.com can test the vessel before real translation data passes through.
 */
const assert = require('assert');
const buildRoutes = require('../routes/translations.js');

async function run() {
	const calls = [];
	const services = {
		seriesTranslations: async input => {
			calls.push(['series', input]);
			return { success: ['translated-post'] };
		},
		seriesCoverage: async input => {
			calls.push(['coverage', input]);
			return { success: { missingPostIds: ['missing-post'] } };
		},
		postTranslations: async input => {
			calls.push(['post', input]);
			return { success: [{ content: 'English' }] };
		},
		searchTranslations: async input => {
			calls.push(['search', input]);
			return { success: [{ content: 'Found' }] };
		}
	};
	const $i = {
		request: { method: 'GET' },
		$_GET: { offset: '2', limit: '5', q: 'light' }
	};
	const routes = buildRoutes({ $i, translationServices: services });
	const vars = { heichel: 'ikar', series: 'seferHaSichos5747' };
	const series = await routes['/heichelos/:heichel/series/:series/translations'](vars);
	assert.deepStrictEqual(series.success, ['translated-post']);
	assert.strictEqual(calls[0][1].offset, '2');
	const coverage = await routes['/heichelos/:heichel/series/:series/translations/coverage'](vars);
	assert.deepStrictEqual(coverage.success.missingPostIds, ['missing-post']);
	assert.strictEqual(calls[1][1].limit, '5');
	const post = await routes['/heichelos/:heichel/series/:series/post/:post/translations']({
		...vars,
		post: 'post-1'
	});
	assert.strictEqual(post.success[0].content, 'English');
	assert.strictEqual(calls[2][1].postId, 'post-1');
	const found = await routes['/heichelos/:heichel/series/:series/translations/search'](vars);
	assert.strictEqual(found.success[0].content, 'Found');
	assert.strictEqual(calls[3][1].query, 'light');
	$i.$_GET.q = '';
	const missing = await routes['/heichelos/:heichel/series/:series/translations/search'](vars);
	assert.strictEqual(missing?.error?.code || missing?.code, 'MISSING_PARAMS');
	$i.request.method = 'POST';
	const rejected = await routes['/heichelos/:heichel/series/:series/translations'](vars);
	assert.strictEqual(rejected?.error?.code || rejected?.code, 'GET_ONLY');
	console.log('translationRoutes.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
