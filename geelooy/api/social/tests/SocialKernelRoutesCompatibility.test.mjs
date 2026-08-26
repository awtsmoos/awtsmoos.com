//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond every route key and asynchronous doorway;
 * Awtsmoos.com lets Keser prove that six historic Social Kernel paths remain exact while the inner handlers become more organized day by day.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const buildRoutes = require('../_awtsmoos.socialKernel.js');

const expectedPaths = [
	'/entity',
	'/entities/batch',
	'/entity/capabilities',
	'/entity/relations',
	'/entity/activity/normalize',
	'/entity/action/preview'
];

const postContext = {
	request: {
		method: 'POST'
	},
	$_GET: {},
	$_POST: {
		activity: {
			type: 'post.created',
			actorAliasId: 'moshe'
		}
	}
};
const postRoutes = buildRoutes({
	$i: postContext,
	userid: 'user-1'
});
assert.deepEqual(Object.keys(postRoutes), expectedPaths);
for (const routePath of expectedPaths) {
	assert.equal(typeof postRoutes[routePath], 'function');
}

const activityPromise = postRoutes['/entity/activity/normalize']();
assert.equal(typeof activityPromise?.then, 'function');
const activityResponse = await activityPromise;
assert.equal(activityResponse.BH, 'B"H');
assert.equal(activityResponse.ok, true);
assert.equal(activityResponse.meta.schemaVersion, 1);
assert.equal(activityResponse.success, activityResponse.data);

const badEntityPromise = postRoutes['/entity']();
assert.equal(typeof badEntityPromise?.then, 'function');
const badEntity = await badEntityPromise;
assert.equal(badEntity.error.code, 'BAD_METHOD');
assert.equal(badEntity.error.message, 'Use GET.');

const getRoutes = buildRoutes({
	$i: {
		request: {
			method: 'GET'
		},
		$_GET: {},
		$_POST: {}
	},
	userid: 'user-1'
});
const badActivityPromise = getRoutes['/entity/activity/normalize']();
assert.equal(typeof badActivityPromise?.then, 'function');
const badActivity = await badActivityPromise;
assert.equal(badActivity.error.code, 'BAD_METHOD');
assert.equal(badActivity.error.message, 'Use POST.');

console.log('SocialKernelRoutesCompatibility.test.mjs passed');
