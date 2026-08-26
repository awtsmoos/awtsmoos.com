//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond each transport helper and target coordinate;
 * Awtsmoos.com lets the Social Kernel prove that refactoring the boundary preserves every old parsing and response garment.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const tools = require('../helper/socialKernel/routes/SocialKernelRouteTools.js');

const frozenTarget = Object.freeze({
	entityType: 'post',
	entityId: 'p1',
	heichelId: 'h1',
	postId: 'p1'
});
assert.deepEqual(tools.targetFrom(frozenTarget), {
	type: 'post',
	id: 'p1',
	heichelId: 'h1',
	seriesId: 'root',
	postId: 'p1',
	parentId: undefined,
	aliasId: undefined
});
assert.equal(frozenTarget.entityId, 'p1');

const directTargets = [
	{ type: 'alias', id: 'a1' }
];
assert.equal(
	tools.parseTargets({
		$_POST: {
			targets: directTargets
		}
	}),
	directTargets
);
assert.deepEqual(
	tools.parseTargets({
		$_POST: {
			targets: '[{"type":"post","id":"p2"}]'
		}
	}),
	[
		{ type: 'post', id: 'p2' }
	]
);
assert.deepEqual(
	tools.parseTargets({
		$_POST: {
			targets: '{broken'
		}
	}),
	[]
);

for (const value of [1, true, '1', 'true', 'yes', 'on']) {
	assert.equal(tools.truthyFlag(value), true);
}
for (const value of [0, false, '', 'false', 'off']) {
	assert.equal(tools.truthyFlag(value), false);
}

assert.equal(
	tools.methodOnly(
		{
			request: {
				method: 'GET'
			}
		},
		'GET'
	),
	null
);
const badMethod = tools.methodOnly(
	{
		request: {
			method: 'POST'
		}
	},
	'GET'
);
assert.equal(badMethod.error.code, 'BAD_METHOD');
assert.equal(badMethod.error.message, 'Use GET.');

const data = {
	capabilities: ['read']
};
assert.deepEqual(tools.ok(data, { requested: 1 }), {
	BH: 'B"H',
	ok: true,
	data,
	success: data,
	meta: {
		schemaVersion: 1,
		requested: 1
	}
});

console.log('SocialKernelRouteToolsCompatibility.test.mjs passed');
