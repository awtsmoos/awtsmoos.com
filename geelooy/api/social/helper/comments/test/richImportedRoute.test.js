// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Imported-only rich comment route proof.
 * @description
 * The Awtsmoos proves Meluket translations and summaries can be paged without a
 * single native comment-tree read. The native DB getter deliberately explodes.
 */
const assert = require('assert');
const richRoutes = require('../routes/rich.js');

const postId = 'BH_POST_1766518917294_theRebbe_722';
let nativeReads = 0;
const $i = {
	request: { method: 'GET' },
	$_GET: { seriesId: 'אדר_meluket', kind: 'sectionSummaryBrief', limit: '2' },
	$_POST: {},
	$_DELETE: {},
	db: {
		async get() {
			nativeReads++;
			throw new Error('native comment storage must not be touched');
		},
		async getValue() {
			return { id: postId, title: 'Meluket', content: [], sections: [] };
		}
	}
};

async function run() {
	const routes = richRoutes({ $i, userid: null });
	const endpoint = routes['/heichelos/:heichel/posts/:post/imported-comment-tree'];
	assert.equal(typeof endpoint, 'function');
	const summaries = await endpoint({ heichel: 'ikar', post: postId });
	assert.equal(nativeReads, 0);
	assert.ok(summaries.success.length > 0 && summaries.success.length <= 2);
	assert.ok(summaries.success.every(row => row.imported === true));
	assert.ok(summaries.success.every(row => row.dayuh?.kind === 'sectionSummaryBrief'));
	assert.ok(summaries.meta.totalImportedRows >= summaries.success.length);

	$i.$_GET = { seriesId: 'אדר_meluket', kind: 'translation', limit: '3' };
	const translations = await endpoint({ heichel: 'ikar', post: postId });
	assert.equal(nativeReads, 0);
	assert.ok(translations.success.length > 0 && translations.success.length <= 3);
	assert.ok(translations.success.every(row => row.dayuh?.kind === 'translation'));

	$i.request.method = 'POST';
	const blocked = await endpoint({ heichel: 'ikar', post: postId });
	assert.equal(blocked.error?.code, 'IMPORTED_COMMENT_READ_ONLY');
	assert.equal(nativeReads, 0);
	console.log('richImportedRoute.test.js PASS');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
