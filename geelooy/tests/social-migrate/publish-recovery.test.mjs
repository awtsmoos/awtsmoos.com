//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { planTranches } from '../../social/migrate/js/publish/PlanTranches.js';
import { migrationManifest } from '../../social/migrate/js/publish/ManifestBuilder.js';
import { AssetUploader } from '../../social/migrate/js/upload/AssetUploader.js';
import { MigrationCheckpoint } from '../../social/migrate/js/state/MigrationCheckpoint.js';
import { MigrationRunner } from '../../social/migrate/js/publish/MigrationRunner.js';

test('long archives plan in bounded 250-item tranches', () => {
	const groups = planTranches(Array.from({ length: 615 }, (_, index) => index));
	assert.deepEqual(groups.map(group => group.length), [250, 250, 115]);
});

test('manifest maps only already-uploaded public attachment evidence', () => {
	const state = {
		destination: { aliasId: 'a', heichelId: 'h', seriesId: 's' },
		uploadedAssets: {
			'media/a.jpg': {
				publicPath: '/api/social/assets/a/asset-1',
				type: 'image',
				mime: 'image/jpeg',
				privateProviderField: 'never-cross'
			}
		}
	};
	const [item] = migrationManifest(state, [{
		id: 'facebook:1',
		provider: 'facebook',
		sourceId: '1',
		title: '',
		content: 'Memory',
		mediaPaths: ['media/a.jpg', 'media/missing.jpg']
	}]).items;
	assert.equal(item.publicAssets.length, 1);
	assert.equal(item.publicAssets[0].publicPath, '/api/social/assets/a/asset-1');
	assert.equal(item.publicAssets[0].privateProviderField, undefined);
});

test('asset uploader sends no more than four files per request', async () => {
	const sizes = [];
	const fetcher = async (_url, options) => {
		const files = options.body.getAll('files');
		sizes.push(files.length);
		return new Response(JSON.stringify({
			success: files.map((file, index) => ({
				publicPath: `/api/social/assets/a/${sizes.length}-${index}`
			})),
			rate: { remaining: 10 }
		}), { status: 200, headers: { 'content-type': 'application/json' } });
	};
	const uploader = new AssetUploader(fetcher);
	const paths = Array.from({ length: 9 }, (_, index) => `m/${index}.jpg`);
	const result = await uploader.uploadPaths({
		aliasId: 'a',
		paths,
		resolveMedia: async path => ({
			path,
			kind: 'image',
			file: new File([path], path.split('/').pop())
		})
	});
	assert.deepEqual(sizes, [4, 4, 1]);
	assert.equal(Object.keys(result).length, 9);
});

test('checkpoint stores serializable evidence and no browser-only archive state', () => {
	const values = new Map();
	const storage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value),
		removeItem: key => values.delete(key)
	};
	const checkpoint = new MigrationCheckpoint(storage);
	const saved = checkpoint.save({
		selectedIds: new Set(['facebook:1']),
		destination: { aliasId: 'a', heichelId: 'h', seriesId: 'root' },
		uploadedAssets: { local: { publicPath: '/api/social/assets/a/1', type: 'image' } },
		completed: { key: 'native-1' },
		failures: []
	});
	assert.deepEqual(checkpoint.load(), saved);
	assert.doesNotMatch(JSON.stringify(saved), /blob:|File|secretKey|accessKey|Authorization/);
});

test('publication failures retain a composite retry identity', async () => {
	const checkpoint = { save() {} };
	const runner = new MigrationRunner({
		api: { publish: async () => { throw new Error('no'); } },
		uploader: {},
		checkpoint
	});
	const state = { completed: {}, failures: [] };
	await runner.publish(state, [{
		provider: 'facebook',
		sourceId: '42',
		publicationPlan: { idempotencyKey: 'meta:facebook:42' }
	}]);
	assert.equal(state.failures[0].itemId, 'facebook:42');
});
