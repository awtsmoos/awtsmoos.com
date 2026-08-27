//B"H
//Boruch Hashem
//Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '../..');
const guard = require(path.join(root, 'api/social/helper/migrations/meta/MetaManifestGuard.js'));
const manifest = require(path.join(root, 'api/social/helper/migrations/meta/MetaManifest.js'));
const kinds = require(path.join(root, 'api/social/helper/migrations/meta/MetaContentKind.js'));

function loadCjs(relative, stubs = {}) {
	const filename = path.join(root, relative);
	const source = fs.readFileSync(filename, 'utf8');
	const module = { exports: {} };
	vm.runInNewContext(`(function(require,module,exports){${source}\n})(require,module,module.exports);`, {
		module,
		require: id => {
			if (stubs[id]) return stubs[id];
			if (id === 'crypto') return require('crypto');
			throw new Error(`Unexpected require ${id}`);
		}
	});
	return module.exports;
}

function provenanceSchema() {
	const cleanText = (value, max) => String(value ?? '').trim().slice(0, max);
	return loadCjs('api/social/helper/richSocial/SourceProvenanceSchema.js', {
		'./TextSanitizer.js': { cleanText }
	});
}

test('Meta guard rejects oversized, secret-shaped, and foreign-asset plans', () => {
	const base = { aliasId: 'a', heichelId: 'h', items: [] };
	assert.equal(guard.guardManifest({ ...base, access_token: 'secret' }).valid, false);
	assert.equal(guard.guardManifest({
		...base,
		items: Array.from({ length: 251 }, () => ({ provider: 'facebook', sourceId: 'x' }))
	}).valid, false);
	assert.equal(guard.guardManifest({
		...base,
		items: [{ provider: 'facebook', sourceId: 'x', publicAssets: [{ url: 'https://remote.example/x.jpg' }] }]
	}).valid, false);
});

test('Meta normalization keeps unknown dates unknown and maps content kinds', () => {
	const value = manifest.normalizeItem({
		provider: 'instagram',
		sourceId: 'r1',
		sourceType: 'reel',
		publishedAt: '',
		publicAssets: [{
			type: 'video',
			mime: 'video/mp4',
			publicPath: 'https://archive.org/download/item/video.mp4'
		}]
	});
	assert.equal(value.publishedAt, '');
	assert.equal(value.contentKind, 'short');
	assert.equal(value.publicAssets.length, 1);
	assert.equal(kinds.metaContentKind('story'), 'story');
	assert.equal(kinds.metaContentKind('video'), 'video');
});

test('shared provenance preserves Meta source and historical counts', () => {
	const schema = provenanceSchema();
	const value = schema.normalizeSourceProvenance({
		provider: 'facebook',
		sourceId: 'p1',
		sourceType: 'photo',
		sourceProfile: { id: 'profile', name: 'Creator' },
		archive: { rawPath: 'posts/a.json', mediaPaths: ['media/a.jpg'] },
		reactionCount: 12,
		commentCount: 4,
		shareCount: 2
	});
	assert.equal(value.provider, 'facebook');
	assert.equal(value.archive.rawPath, 'posts/a.json');
	assert.equal(value.archive.mediaPaths[0], 'media/a.jpg');
	assert.deepEqual([value.reactionCount, value.commentCount, value.shareCount], [12, 4, 2]);
});

test('Meta plans preserve unknown chronology and deterministic idempotency', () => {
	const diagnostics = {
		fingerprint: () => 'fingerprint',
		statistics: () => ({}),
		warnings: () => []
	};
	const planner = loadCjs('api/social/helper/migrations/meta/MetaMigrationPlan.js', {
		'./MetaMigrationDiagnostics.js': diagnostics,
		'./MetaSourceProvenance.js': { metaSourceProvenance: item => ({ provider: item.provider }) }
	});
	const normalized = manifest.normalizeManifest({
		aliasId: 'alias',
		heichelId: 'heichel',
		seriesId: 'series',
		items: [{ provider: 'facebook', sourceId: '42', sourceType: 'post', content: 'Memory' }]
	});
	const first = planner.buildMigrationPlan(normalized);
	const second = planner.buildMigrationPlan(normalized);
	assert.equal(first.apiVersion, 3);
	assert.equal(first.publishesHere, false);
	assert.equal(first.entries[0].chronology.year, 'Unknown');
	assert.equal(
		first.entries[0].publicationPlan.idempotencyKey,
		second.entries[0].publicationPlan.idempotencyKey
	);
});
