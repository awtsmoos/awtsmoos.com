//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Unit tests for Drive downloads: URL resolution, batch sequencing,
 * progress callbacks, and capability gating. No network, no DOM; the
 * transport and anchor seams are injected as fakes.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { describeBulkCapabilities } from '../js/bulkCapabilities.js';
import {
	DOWNLOAD_GAP_MS,
	downloadEntries,
	downloadEntry,
	downloadFileName,
	resolveDownloadTarget
} from '../js/downloads.js';

const context = {
	origin: 'https://awtsmoos.com',
	apiRoot: '/api/social',
	alias: 'test-alias',
	encodePath: value => String(value).split('/').map(encodeURIComponent).join('/')
};

const publicFile = { type: 'file', path: 'photos/sunset pic.jpg', visibility: 'public', name: 'sunset pic.jpg' };
const privateFile = { type: 'file', path: 'docs/notes.txt', visibility: 'private', name: 'notes.txt' };
const privateNoName = { type: 'file', path: 'docs/untitled.md', visibility: 'private' };
const folder = { type: 'folder', path: 'photos', visibility: 'private' };
const trashed = { type: 'file', path: 'docs/old.txt', visibility: 'private', trashedAt: '2026-01-01' };

test('public files resolve to the open public stream URL', () => {
	const target = resolveDownloadTarget(publicFile, context);
	assert.equal(target.channel, 'public');
	assert.equal(target.filename, 'sunset pic.jpg');
	assert.equal(
		target.url,
		'https://awtsmoos.com/api/social/drive/public/test-alias/photos/sunset%20pic.jpg'
	);
});

test('private files resolve to the guarded entry channel with auth from transport', () => {
	const target = resolveDownloadTarget(privateFile, context);
	assert.equal(target.channel, 'private');
	assert.equal(target.filename, 'notes.txt');
	assert.equal(
		target.url,
		'https://awtsmoos.com/api/social/drive/test-alias/entry/docs/notes.txt?content=1'
	);
});

test('filename falls back to the path leaf when the entry has no name', () => {
	assert.equal(downloadFileName(privateNoName), 'untitled.md');
	assert.equal(downloadFileName({}), 'file');
});

test('folders cannot resolve a download target (no server archive endpoint)', () => {
	assert.throws(() => resolveDownloadTarget(folder, context), /Only files can be downloaded/);
});

test('trashed files refuse to resolve until restored', () => {
	assert.throws(() => resolveDownloadTarget(trashed, context), /Restore the file/);
});

test('single public download opens one anchor with the true filename', async () => {
	const opened = [];
	const result = await downloadEntry(publicFile, {
		context,
		openAnchor: (url, filename) => opened.push({ url, filename })
	});
	assert.equal(opened.length, 1);
	assert.equal(opened[0].filename, 'sunset pic.jpg');
	assert.ok(opened[0].url.includes('/drive/public/test-alias/'));
	assert.equal(result.channel, 'public');
});

test('single private download fetches guarded bytes before opening the anchor', async () => {
	const fetched = [];
	const opened = [];
	const body = { content: new ArrayBuffer(3), mimeType: 'text/plain' };
	const result = await downloadEntry(privateFile, {
		context,
		openAnchor: (url, filename) => opened.push({ url, filename }),
		fetchPrivateBytes: async path => {
			fetched.push(path);
			return body;
		}
	});
	assert.deepEqual(fetched, ['docs/notes.txt']);
	assert.equal(opened.length, 1);
	assert.equal(opened[0].filename, 'notes.txt');
	assert.ok(opened[0].url.startsWith('blob:'));
	assert.equal(result.channel, 'private');
});

test('batch downloads run sequentially with progress for every file', async () => {
	const order = [];
	const progress = [];
	const deps = {
		context,
		gapMs: 5,
		openAnchor: (url, filename) => order.push(filename),
		fetchPrivateBytes: async () => ({ content: new ArrayBuffer(1), mimeType: 'text/plain' })
	};
	const ledger = await downloadEntries([publicFile, privateFile, publicFile], event => progress.push(event), deps);
	assert.deepEqual(order, ['sunset pic.jpg', 'notes.txt', 'sunset pic.jpg']);
	assert.equal(ledger.succeeded.length, 3);
	assert.equal(ledger.failed.length, 0);
	assert.deepEqual(progress.map(event => event.index), [1, 2, 3]);
	assert.ok(progress.every(event => event.total === 3));
	assert.equal(progress[1].filename, 'notes.txt');
});

test('batch keeps an honest ledger when one file fails', async () => {
	const progress = [];
	const deps = {
		context,
		gapMs: 0,
		openAnchor: () => {},
		fetchPrivateBytes: async path => {
			if (path === 'docs/notes.txt') throw new Error('boom');
			return { content: new ArrayBuffer(1), mimeType: 'text/plain' };
		}
	};
	const ledger = await downloadEntries([publicFile, privateFile], event => progress.push(event), deps);
	assert.equal(ledger.succeeded.length, 1);
	assert.equal(ledger.failed.length, 1);
	assert.equal(ledger.failed[0].entry.path, 'docs/notes.txt');
	assert.equal(ledger.failed[0].message, 'boom');
	assert.equal(progress.length, 2);
	assert.equal(progress[1].failed, 1);
});

test('batch applies a gap between files so the browser registers each download', () => {
	assert.ok(DOWNLOAD_GAP_MS > 0);
});

test('canDownload is true only for active file selections', () => {
	assert.equal(describeBulkCapabilities([publicFile, privateFile]).canDownload, true);
	assert.equal(describeBulkCapabilities([]).canDownload, false);
	assert.equal(describeBulkCapabilities([publicFile, folder]).canDownload, false);
	assert.equal(describeBulkCapabilities([folder]).canDownload, false);
	assert.equal(describeBulkCapabilities([trashed]).canDownload, false);
	assert.equal(describeBulkCapabilities([privateFile, trashed]).canDownload, false);
});
