//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { ArchiveOrgUploader } from '../../shared/storage/archiveOrg/ArchiveOrgUploader.js';

/**
 * @file xhr-uploader.test.mjs
 * @description
 * The Awtsmoos distinguishes permanent rejection from temporary Archive weather while direct video bytes remain outside Awtsmoos.com;
 * this vessel proves progress, ETag evidence, bounded retry classes, and cancellation before higher recovery law may come.
 */
class FakeXhr {
	constructor(status = 200) {
		this.status = status;
		this.upload = {};
		this.headers = {};
		this.etag = '"etag"';
		this.aborted = false;
	}

	open(method, url) {
		this.method = method;
		this.url = url;
	}

	setRequestHeader(name, value) {
		this.headers[name] = value;
	}

	getResponseHeader(name) {
		return name === 'etag' ? this.etag : '';
	}

	send(file) {
		this.file = file;
		queueMicrotask(() => {
			if (this.aborted) return;
			this.upload.onprogress?.({
				loaded: file.size / 2,
				total: file.size,
				lengthComputable: true
			});
			if (!this.aborted) this.onload?.();
		});
	}

	abort() {
		if (this.aborted) return;
		this.aborted = true;
		queueMicrotask(() => this.onabort?.());
	}
}

async function expectStatus(status, code) {
	const uploader = new ArchiveOrgUploader(() => new FakeXhr(status));
	await assert.rejects(() => uploader.put({
		url: 'https://s3.us.archive.org/item/video.mp4',
		file: { size: 1 },
		headers: {}
	}), error => error.code === code && error.status === status);
}

test('XHR uploader exposes byte progress and direct PUT evidence', async () => {
	const xhr = new FakeXhr(200);
	const uploader = new ArchiveOrgUploader(() => xhr);
	const progress = [];
	const result = await uploader.put({
		url: 'https://s3.us.archive.org/item/video.mp4',
		file: { size: 100 },
		headers: { Authorization: 'LOW A:S' },
		onProgress: value => progress.push(value)
	});
	assert.equal(xhr.method, 'PUT');
	assert.equal(xhr.headers.Authorization, 'LOW A:S');
	assert.equal(result.status, 200);
	assert.equal(result.etag, '"etag"');
	assert.deepEqual(progress[0], { loaded: 50, total: 100, ratio: 0.5 });
});

test('XHR uploader classifies authentication, slowdown, transient server, and permanent responses', async () => {
	for (const [status, code] of [
		[401, 'AUTH'],
		[403, 'AUTH'],
		[429, 'SLOW_DOWN'],
		[503, 'SLOW_DOWN'],
		[408, 'SERVER'],
		[425, 'SERVER'],
		[500, 'SERVER'],
		[502, 'SERVER'],
		[400, 'HTTP']
	]) {
		await expectStatus(status, code);
	}
});

test('AbortSignal cancels the direct browser upload', async () => {
	const controller = new AbortController();
	const uploader = new ArchiveOrgUploader(() => new FakeXhr(200));
	const promise = uploader.put({
		url: 'https://s3.us.archive.org/item/video.mp4',
		file: { size: 100 },
		headers: {},
		signal: controller.signal
	});
	controller.abort();
	await assert.rejects(() => promise, error => error.code === 'ABORTED');
});
