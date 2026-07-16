// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const AutoAsync = require("../tools/fs/autoAsync.js");

/**
 * Remote callers cannot turn a bulk action into event-loop work. Only a local
 * operator environment override or the already-isolated child may run inline.
 */
const previousChild = process.env.AWTSMOOS_ASYNC_CHILD;
const previousOverride = process.env.AWTSMOOS_ALLOW_INLINE_HEAVY;

try {
	delete process.env.AWTSMOOS_ASYNC_CHILD;
	delete process.env.AWTSMOOS_ALLOW_INLINE_HEAVY;
	for (const flag of ["sync", "inline", "blocking", "noAutoAsync"]) {
		assert.equal(
			AutoAsync.shouldOffload("actionBatch", { [flag]: true }),
			true,
			`${flag} must not force remote inline execution`
		);
	}
	process.env.AWTSMOOS_ALLOW_INLINE_HEAVY = "1";
	assert.equal(AutoAsync.shouldOffload("actionBatch", { blocking: true }), false);
	delete process.env.AWTSMOOS_ALLOW_INLINE_HEAVY;
	process.env.AWTSMOOS_ASYNC_CHILD = "1";
	assert.equal(AutoAsync.shouldOffload("actionBatch", {}), false);

	console.log(JSON.stringify({
		ok: true,
		suite: "heavy-action-cannot-force-inline",
		remoteInlineDenied: true,
		localOverrideSupported: true,
		childRecursionPrevented: true
	}, null, 2));
} finally {
	if (previousChild === undefined) delete process.env.AWTSMOOS_ASYNC_CHILD;
	else process.env.AWTSMOOS_ASYNC_CHILD = previousChild;
	if (previousOverride === undefined) delete process.env.AWTSMOOS_ALLOW_INLINE_HEAVY;
	else process.env.AWTSMOOS_ALLOW_INLINE_HEAVY = previousOverride;
}
