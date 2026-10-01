// B"H
const assert = require('assert');
const packed = require('../richDb/PackedStore.js');

const old = process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
try {
	delete process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
	assert.throws(
		() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest__: { __fs3ManifestBlob: true } } }, '/tmp/legacy.awtsdb'),
		error => error && error.code === 'RICH_COMMENTS_LEGACY_MIGRATION_REQUIRED'
	);
	assert.doesNotThrow(() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest_meta__: { __fs3Meta: true } } }, '/tmp/v3.awtsdb'));
	process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION = 'true';
	assert.doesNotThrow(() => packed.refuseImplicitLegacyMigration({ root: { __fs3_manifest__: { __fs3ManifestBlob: true } } }, '/tmp/admin.awtsdb'));
	console.log('legacyMigrationGuard.test.js PASS');
} finally {
	if (old === undefined) delete process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION;
	else process.env.AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION = old;
}
