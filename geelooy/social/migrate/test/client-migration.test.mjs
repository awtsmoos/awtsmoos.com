//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../..');
const moduleUrl = relative => pathToFileURL(path.join(root, relative)).href;
const { planTranches } = await import(moduleUrl('social/migrate/js/publish/PlanTranches.js'));
const { migrationManifest } = await import(moduleUrl('social/migrate/js/publish/ManifestBuilder.js'));
const { MigrationCheckpoint } = await import(moduleUrl('social/migrate/js/state/MigrationCheckpoint.js'));
const { ApiError } = await import(moduleUrl('social/migrate/js/publish/ApiError.js'));
const { jsonApi } = await import(moduleUrl('social/migrate/js/publish/JsonApi.js'));

assert.deepEqual(planTranches([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);

const state = {
	destination: { aliasId: 'a', heichelId: 'h', seriesId: 's' },
	uploadedAssets: {
		'photos/a.jpg': {
			id: 'asset-a',
			type: 'image',
			mime: 'image/jpeg',
			publicPath: '/api/social/assets/a/image/asset-a.jpg',
			size: 99
		}
	}
};
const built = migrationManifest(state, [{
	provider: 'instagram',
	sourceId: 'ig-a',
	title: 'Photo',
	content: 'Caption',
	mediaPaths: ['photos/a.jpg']
}]);
assert.equal(built.items[0].publicAssets[0].id, 'asset-a');
assert.equal(built.items[0].publicAssets[0].size, 99);

const memory = new Map();
const storage = {
	getItem: key => memory.get(key) || null,
	setItem: (key, value) => memory.set(key, value),
	removeItem: key => memory.delete(key)
};
const checkpoint = new MigrationCheckpoint(storage);
const saved = checkpoint.save({
	selectedIds: new Set(['instagram:ig-a']),
	destination: state.destination,
	uploadedAssets: state.uploadedAssets,
	completed: { key: 'post-a' },
	failures: []
});
assert.equal(saved.uploadedAssets['photos/a.jpg'].id, 'asset-a');
assert.equal(checkpoint.load().selectedIds[0], 'instagram:ig-a');

const fetcher = async () => new Response(JSON.stringify({
	error: {
		code: 'INVALID_META_MIGRATION',
		message: 'Fix input.',
		issues: [{ path: 'items[0].sourceId' }]
	}
}), { status: 400, headers: { 'content-type': 'application/json' } });

await assert.rejects(
	() => jsonApi('/fake', { fetcher }),
	error => error instanceof ApiError
		&& error.code === 'INVALID_META_MIGRATION'
		&& error.issues.length === 1
);
console.log('client-migration: ok');
