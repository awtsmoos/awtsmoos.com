//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { ArchiveOrgUploadService } from '../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';
import { ArchiveOrgUploadError } from '../../shared/storage/archiveOrg/ArchiveOrgUploader.js';

function video() {
	return { name: 'creator.mp4', type: 'video/mp4', size: 900 };
}

function input() {
	return {
		file: video(),
		mime: 'video/mp4',
		credentials: { accessKey: 'LOCAL_ACCESS', secretKey: 'LOCAL_SECRET' },
		item: {
			provider: 'youtube',
			sourceId: 'source-1',
			title: 'Creator Video',
			sourceProfile: { name: 'Creator' }
		},
		mediaPath: 'creator.mp4'
	};
}

test('service sends secret only to Archive uploader and returns public attachment evidence', async () => {
	const observed = {};
	const service = new ArchiveOrgUploadService({
		overloadClient: {
			async check(value) {
				observed.preflight = value;
				return { overLimit: false };
			}
		},
		uploader: {
			async put(value) {
				observed.put = value;
				return { status: 200 };
			}
		},
		wait: async () => {}
	});
	const asset = await service.uploadVideo(input());
	assert.equal(observed.preflight.accessKey, 'LOCAL_ACCESS');
	assert.equal('secretKey' in observed.preflight, false);
	assert.equal(observed.put.headers.Authorization, 'LOW LOCAL_ACCESS:LOCAL_SECRET');
	assert.match(asset.publicPath, /^https:\/\/archive\.org\/download\//);
	assert.equal(asset.type, 'video');
	assert.equal(JSON.stringify(asset).includes('LOCAL_SECRET'), false);
});

test('SlowDown retries but authentication failures never retry', async () => {
	let attempts = 0;
	const slowService = new ArchiveOrgUploadService({
		overloadClient: { async check() { return { overLimit: false }; } },
		uploader: {
			async put() {
				attempts += 1;
				if (attempts < 3) throw new ArchiveOrgUploadError('slow', 'SLOW_DOWN', 503);
				return { status: 200 };
			}
		},
		wait: async () => {}
	});
	await slowService.uploadVideo(input());
	assert.equal(attempts, 3);
	let authAttempts = 0;
	const authService = new ArchiveOrgUploadService({
		overloadClient: { async check() { return { overLimit: false }; } },
		uploader: {
			async put() {
				authAttempts += 1;
				throw new ArchiveOrgUploadError('bad key', 'AUTH', 401);
			}
		},
		wait: async () => {}
	});
	await assert.rejects(() => authService.uploadVideo(input()), error => error.code === 'AUTH');
	assert.equal(authAttempts, 1);
});

test('over-limit preflight stops before video bytes are sent', async () => {
	let uploads = 0;
	const service = new ArchiveOrgUploadService({
		overloadClient: { async check() { return { overLimit: true }; } },
		uploader: { async put() { uploads += 1; } },
		wait: async () => {},
		maxAttempts: 1
	});
	await assert.rejects(() => service.uploadVideo(input()), error => error.code === 'SLOW_DOWN');
	assert.equal(uploads, 0);
});
