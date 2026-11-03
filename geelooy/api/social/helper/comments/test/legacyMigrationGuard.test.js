// B"H
const assert = require('assert');
const packed = require('../richDb/PackedStore.js');

const old = process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
const oldHardLimit = process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB;
try {
	delete process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
	delete process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB;
	assert.throws(
		() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest__: { __fs3ManifestBlob: true } } }, '/tmp/legacy.awtsdb'),
		error => error && error.code === 'RICH_COMMENTS_LEGACY_MIGRATION_REQUIRED'
	);
	assert.doesNotThrow(() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest_meta__: { __fs3Meta: true } } }, '/tmp/v3.awtsdb'));
	const oversized = require('path').join(require('os').tmpdir(), 'awts-rich-oversized-guard-' + process.pid);
	require('fs').writeFileSync(oversized, Buffer.alloc(1));
	require('fs').truncateSync(oversized, packed.MAX_IMPLICIT_STORE_BYTES + 1);
	// P2 policy: oversized alone never refuses an implicit open (it warns
	// once per file instead); only an explicit hard cap refuses.
	assert.doesNotThrow(() => packed.refuseOversizedImplicitStore(oversized));
	assert.doesNotThrow(() => packed.refuseOversizedImplicitStore(oversized, { allowOversizedStore: true }));
	process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB = '0.5';
	assert.throws(() => packed.refuseOversizedImplicitStore(oversized), error => error && error.code === 'RICH_COMMENTS_STORE_HARD_LIMIT_EXCEEDED');
	delete process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB;
	require('fs').rmSync(oversized, { force: true });
	process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION = 'true';
	assert.doesNotThrow(() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest__: { __fs3ManifestBlob: true } } }, '/tmp/admin.awtsdb'));
	console.log('legacyMigrationGuard.test.js PASS');
} finally {
	if (old === undefined) delete process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
	else process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION = old;
	if (oldHardLimit === undefined) delete process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB;
	else process.env.AWTSMOOS_RICH_STORE_HARD_LIMIT_GIB = oldHardLimit;
}
