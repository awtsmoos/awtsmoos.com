//B"H
//Boruch Hashem
//Blessed is He

const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const metaRoot = path.join(root, 'api/social/helper/migrations/meta');
const { migrationCapabilities } = require(path.join(metaRoot, 'MetaMigrationCapabilities.js'));
const { guardManifest } = require(path.join(metaRoot, 'MetaManifestGuard.js'));
const { normalizeManifest } = require(path.join(metaRoot, 'MetaManifest.js'));
const { buildMigrationPlan } = require(path.join(metaRoot, 'MetaMigrationPlan.js'));

function manifest(overrides = {}) {
	return {
		aliasId: 'alias-a',
		heichelId: 'heichel-a',
		seriesId: 'series-a',
		items: [{
			provider: 'facebook',
			sourceId: 'source-a',
			content: 'A remembered post',
			publishedAt: '',
			mediaPaths: ['facebook/photos/a.jpg'],
			publicAssets: [{
				id: 'asset-a',
				type: 'image',
				mime: 'image/jpeg',
				publicPath: '/api/social/assets/alias-a/image/asset-a.jpg',
				width: 640,
				height: 480,
				size: 1234
			}]
		}],
		...overrides
	};
}

const capabilities = migrationCapabilities();
assert.equal(capabilities.apiVersion, 3);
assert.equal(capabilities.plan.maxItems, 250);
assert.equal(capabilities.upload.maxFilesPerRequest, 4);
assert.equal(capabilities.upload.maxUploadsPerMinute, 18);
assert.equal(capabilities.upload.video.nativeUpload, false);
assert.equal(capabilities.upload.video.provider, 'archive.org');
assert.equal(capabilities.upload.video.serverReceivesCredentials, false);
assert.equal(capabilities.publication.route, '/api/social/unified-social/publish');

assert.equal(guardManifest(manifest()).valid, true);
const duplicate = manifest({
	items: [manifest().items[0], { ...manifest().items[0] }]
});
const duplicateGuard = guardManifest(duplicate);
assert.equal(duplicateGuard.valid, false);
assert(duplicateGuard.issues.some(item => item.code === 'DUPLICATE_SOURCE'));

const unsafe = manifest();
unsafe.items[0].publicAssets[0].publicPath = 'https://cdn.example/image.jpg';
const unsafeGuard = guardManifest(unsafe);
assert(unsafeGuard.issues.some(item => item.code === 'INVALID_ASSET_PATH'));

const normalized = normalizeManifest(manifest());
const planA = buildMigrationPlan(normalized);
const planB = buildMigrationPlan(normalizeManifest(manifest()));
assert.equal(planA.apiVersion, 3);
assert.equal(planA.entries.length, 1);
assert.equal(planA.entries[0].chronology.year, 'Unknown');
assert.equal(planA.entries[0].contentPayload.rootAssets[0].id, 'asset-a');
assert.equal(planA.entries[0].contentPayload.rootAssets[0].publicPath.includes('/api/social/assets/'), true);
assert.equal(planA.planFingerprint, planB.planFingerprint);
assert.equal(
	planA.entries[0].publicationPlan.idempotencyKey,
	planB.entries[0].publicationPlan.idempotencyKey
);
assert(planA.warnings.some(item => item.code === 'UNKNOWN_DATES'));
console.log('server-meta-api: ok');
