// B"H
// Tests for geelooy/apps/drive/js/macBridge.js — no network, no DOM.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	MAC_LOCATION,
	READ_CHUNK_CHARS,
	DEFAULT_CONCURRENCY,
	macPathFor,
	drivePathFor,
	splitName,
	resolveUniqueName,
	defaultRouteSelector,
	normalizeRoutes,
	readWholeFile,
	createVfsCopyProvider,
	createResumableTransferProvider,
	selectProvider,
	createTransferEngine,
	planDestinations,
	sendToMac,
	fetchFromMac,
	FolderPicker,
	mountBridgeDialog
} from './macBridge.js';

/* ---------- helpers ---------- */

function mockVfs(files = {}) {
	// files: { 'vfs/path': 'content' }
	const store = { ...files };
	const calls = { reads: [], writes: [] };
	let concurrent = 0;
	let maxConcurrent = 0;
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	return {
		calls,
		store,
		get maxConcurrent() { return maxConcurrent; },
		async list(vfsPath) {
			const prefix = vfsPath.replace(/\/+$/, '') + '/';
			const names = new Set();
			for (const key of Object.keys(store)) {
				if (key.startsWith(prefix)) {
					const rest = key.slice(prefix.length);
					const head = rest.split('/')[0];
					if (head) names.add(rest.includes('/') ? { name: head, type: 'folder' } : { name: head, type: 'file' });
				}
			}
			return [...names];
		},
		async read(vfsPath, opts = {}) {
			concurrent += 1;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			try {
				calls.reads.push({ vfsPath, opts });
				await delay(1);
				const content = store[vfsPath];
				if (content === undefined) return { ok: false, error: 'ENOENT' };
				const offset = Number(opts.offsetChars) || 0;
				const max = Number(opts.maxChars) || READ_CHUNK_CHARS;
				const slice = content.slice(offset, offset + max);
				return {
					ok: true,
					content: slice,
					offsetChars: offset,
					returnedChars: slice.length,
					totalChars: content.length,
					nextOffsetChars: offset + slice.length < content.length ? offset + slice.length : null
				};
			} finally {
				concurrent -= 1;
			}
		},
		async write(vfsPath, content) {
			calls.writes.push({ vfsPath, length: String(content).length });
			store[vfsPath] = String(content);
			return { ok: true };
		},
		async stat(vfsPath) {
			return { ok: true, node: { path: vfsPath } };
		}
	};
}

/* ---------- pure helpers ---------- */

test('MAC_LOCATION exposes the /network/ VFS prefix', () => {
	assert.equal(MAC_LOCATION.id, 'mac');
	assert.equal(MAC_LOCATION.vfsPrefix, '/network/');
});

test('macPathFor builds route paths', () => {
	assert.equal(macPathFor('tun_abc', 'docs/a.txt'), '/network/tun_abc/docs/a.txt');
	assert.equal(macPathFor('tun_abc', ''), '/network/tun_abc');
	assert.equal(macPathFor('tun_abc', '/docs/'), '/network/tun_abc/docs');
});

test('drivePathFor maps to the /drive mount', () => {
	assert.equal(drivePathFor('a/b.txt'), '/drive/a/b.txt');
	assert.equal(drivePathFor('/drive/a/b.txt'), '/drive/a/b.txt');
	assert.equal(drivePathFor(''), '/drive');
});

test('splitName handles extensions', () => {
	assert.deepEqual(splitName('photo.jpg'), { stem: 'photo', ext: '.jpg' });
	assert.deepEqual(splitName('archive.tar.gz'), { stem: 'archive.tar', ext: '.gz' });
	assert.deepEqual(splitName('README'), { stem: 'README', ext: '' });
	assert.deepEqual(splitName('.hidden'), { stem: '.hidden', ext: '' });
});

test('resolveUniqueName never overwrites', () => {
	assert.equal(resolveUniqueName(['b.txt'], 'a.txt'), 'a.txt');
	assert.equal(resolveUniqueName(['a.txt'], 'a.txt'), 'a (2).txt');
	assert.equal(resolveUniqueName(['a.txt', 'a (2).txt'], 'a.txt'), 'a (3).txt');
	assert.equal(resolveUniqueName(['README'], 'README'), 'README (2)');
	assert.equal(resolveUniqueName(['A.TXT'], 'a.txt'), 'a (2).txt'); // case-insensitive
	assert.equal(resolveUniqueName([], 'x'), 'x');
});

test('defaultRouteSelector prefers a live native route', () => {
	const routes = [
		{ route: 'virtual', title: 'Virtual', alive: true, isVirtual: true },
		{ route: 'tun_dead', title: 'Mac', alive: false, isVirtual: false },
		{ route: 'tun_live', title: 'Mac', alive: true, isVirtual: false }
	];
	assert.equal(defaultRouteSelector(routes).route, 'tun_live');
	assert.equal(defaultRouteSelector([{ route: 'v', alive: true, isVirtual: true }]).route, 'v');
	assert.equal(defaultRouteSelector([]), null);
});

test('normalizeRoutes filters empty routes', () => {
	const out = normalizeRoutes([
		{ route: 'tun_1', deviceName: 'Yackovs-Air', platform: 'darwin', connected: true },
		{ route: '', title: 'junk' }
	]);
	assert.equal(out.length, 1);
	assert.equal(out[0].title, 'Yackovs-Air');
	assert.equal(out[0].alive, true);
});

/* ---------- readWholeFile ---------- */

test('readWholeFile streams in chunks with offsets', async () => {
	const big = 'x'.repeat(READ_CHUNK_CHARS * 2 + 500);
	const vfs = mockVfs({ '/network/r/big.bin': big });
	const out = await readWholeFile(vfs.read, '/network/r/big.bin', {});
	assert.equal(out, big);
	const offsets = vfs.calls.reads.map(call => Number(call.opts.offsetChars) || 0);
	assert.deepEqual(offsets, [0, READ_CHUNK_CHARS, READ_CHUNK_CHARS * 2]);
});

test('readWholeFile completes small files in one read', async () => {
	const content = 'hello world';
	let calls = 0;
	const read = async () => {
		calls += 1;
		return { ok: true, content }; // no offsetChars echoed: not seekable
	};
	const out = await readWholeFile(read, '/p', {});
	assert.equal(out, content);
	assert.equal(calls, 1);
});

test('readWholeFile refuses to silently truncate when offsets are unsupported', async () => {
	const big = 'x'.repeat(READ_CHUNK_CHARS + 10);
	let calls = 0;
	const read = async () => {
		calls += 1;
		// Truncated chunk WITH totalChars: provable truncation, no offset echo.
		return { ok: true, content: big.slice(0, READ_CHUNK_CHARS), totalChars: big.length };
	};
	await assert.rejects(
		() => readWholeFile(read, '/p', {}),
		error => error?.code === 'READ_RANGE_UNSUPPORTED'
	);
	assert.equal(calls, 2); // first chunk + one seekability probe
});

test('readWholeFile surfaces read errors', async () => {
	const vfs = mockVfs({});
	await assert.rejects(
		() => readWholeFile(vfs.read, '/network/r/missing', {}),
		/ENOENT/
	);
});

test('readWholeFile honors abort between chunks', async () => {
	const big = 'x'.repeat(READ_CHUNK_CHARS * 3);
	const vfs = mockVfs({ '/p': big });
	const controller = new AbortController();
	const pending = readWholeFile(vfs.read, '/p', { signal: controller.signal });
	controller.abort();
	await assert.rejects(pending, /cancelled/i);
});

/* ---------- provider conformance ---------- */

test('vfsCopyProvider conforms to the TransferProvider interface', async () => {
	const vfs = mockVfs({ '/drive/a.txt': 'data-123' });
	const provider = createVfsCopyProvider({ read: vfs.read, write: vfs.write });
	assert.equal(provider.name, 'vfs-copy');
	assert.equal(provider.resumable, false);
	const seen = [];
	const result = await provider.copyFile('/drive/a.txt', '/network/r/a.txt', {
		onProgress: ({ bytes }) => seen.push(bytes)
	});
	assert.deepEqual(result, { ok: true, bytes: 8 });
	assert.equal(vfs.store['/network/r/a.txt'], 'data-123');
	assert.ok(seen.length >= 1 && seen.at(-1) === 8);
});

test('vfsCopyProvider throws when read/write are missing', () => {
	assert.throws(() => createVfsCopyProvider({}), /requires \{ read, write \}/);
});

test('resumable stub is unavailable without sibling actions', async () => {
	const provider = createResumableTransferProvider();
	assert.equal(provider.available, false);
	await assert.rejects(
		() => provider.copyFile('/a', '/b', {}),
		error => error?.code === 'RESUMABLE_TRANSFER_UNAVAILABLE'
	);
});

test('resumable stub drives the begin/chunk/commit handshake', async () => {
	const calls = [];
	const provider = createResumableTransferProvider({
		begin: async payload => { calls.push(['begin', payload]); return { ok: true, transferId: 't1', chunkChars: 4 }; },
		chunk: async payload => {
			calls.push(['chunk', payload.transferId, payload.offset]);
			return payload.offset === 0 ? { ok: true, received: 4 } : { ok: true, received: 0 };
		},
		commit: async payload => { calls.push(['commit', payload.transferId]); return { ok: true, bytes: 4 }; },
		abort: async payload => { calls.push(['abort', payload.transferId]); return { ok: true }; }
	});
	assert.equal(provider.available, true);
	const seen = [];
	const result = await provider.copyFile('/a', '/b', { onProgress: ({ bytes }) => seen.push(bytes) });
	assert.deepEqual(result, { ok: true, bytes: 4 });
	assert.deepEqual(seen, [4]);
	assert.deepEqual(calls.map(call => call[0]), ['begin', 'chunk', 'chunk', 'commit']);
});

test('resumable stub aborts the transfer on chunk failure', async () => {
	const calls = [];
	const provider = createResumableTransferProvider({
		begin: async () => ({ ok: true, transferId: 't9', chunkChars: 4 }),
		chunk: async () => ({ ok: false, error: 'boom' }),
		commit: async () => ({ ok: true }),
		abort: async payload => { calls.push(payload.transferId); return { ok: true }; }
	});
	await assert.rejects(() => provider.copyFile('/a', '/b', {}), /boom/);
	assert.deepEqual(calls, ['t9']);
});

test('selectProvider prefers resumable when wired, else vfs-copy', () => {
	const vfs = mockVfs({});
	const plain = selectProvider({ read: vfs.read, write: vfs.write });
	assert.equal(plain.name, 'vfs-copy');
	const wired = selectProvider({
		read: vfs.read,
		write: vfs.write,
		resumableActions: { begin: async () => ({}), chunk: async () => ({}), commit: async () => ({}), abort: async () => ({}) }
	});
	assert.equal(wired.name, 'resumable-transfer');
});

/* ---------- engine ---------- */

test('engine copies every file and accounts progress', async () => {
	const drive = mockVfs({ '/drive/a.txt': 'aaa', '/drive/b.txt': 'bb' });
	const mac = mockVfs({});
	const progress = [];
	const engine = createTransferEngine({
		provider: createVfsCopyProvider({ read: drive.read, write: mac.write }),
		plan: [
			{ src: '/drive/a.txt', dest: '/network/r/a.txt', name: 'a.txt' },
			{ src: '/drive/b.txt', dest: '/network/r/b.txt', name: 'b.txt' }
		],
		concurrency: 2,
		onProgress: snapshot => progress.push({ ...snapshot })
	});
	const final = await engine.start();
	assert.equal(final.done, 2);
	assert.equal(final.total, 2);
	assert.equal(final.failed, 0);
	assert.equal(final.bytes, 5);
	assert.equal(mac.store['/network/r/a.txt'], 'aaa');
	assert.equal(mac.store['/network/r/b.txt'], 'bb');
	assert.ok(progress.length > 0);
	assert.equal(progress.at(-1).done, 2);
});

test('engine bounds concurrency', async () => {
	const drive = mockVfs({
		'/drive/1': 'a', '/drive/2': 'b', '/drive/3': 'c',
		'/drive/4': 'd', '/drive/5': 'e', '/drive/6': 'f'
	});
	const mac = mockVfs({});
	const engine = createTransferEngine({
		provider: createVfsCopyProvider({ read: drive.read, write: mac.write }),
		plan: Object.keys(drive.store)
			.filter(key => key.startsWith('/drive/'))
			.map(key => ({ src: key, dest: `/network/r/${key.split('/').pop()}`, name: key })),
		concurrency: 4
	});
	await engine.start();
	assert.ok(drive.maxConcurrent <= 4, `saw ${drive.maxConcurrent} concurrent reads`);

	const drive2 = mockVfs({ '/drive/1': 'a', '/drive/2': 'b', '/drive/3': 'c' });
	const mac2 = mockVfs({});
	const engine2 = createTransferEngine({
		provider: createVfsCopyProvider({ read: drive2.read, write: mac2.write }),
		plan: ['/drive/1', '/drive/2', '/drive/3'].map(key => ({ src: key, dest: `/network/r/${key.split('/').pop()}`, name: key })),
		concurrency: 2
	});
	await engine2.start();
	assert.ok(drive2.maxConcurrent <= 2, `saw ${drive2.maxConcurrent} concurrent reads`);
});

test('engine marks errors and retryFailed re-runs them', async () => {
	const drive = mockVfs({ '/drive/ok.txt': 'ok', '/drive/bad.txt': 'bad' });
	const mac = mockVfs({});
	let failBad = true;
	const provider = {
		name: 'flaky',
		resumable: false,
		async copyFile(src, dest, { onProgress }) {
			if (src.endsWith('bad.txt') && failBad) throw new Error('transient');
			onProgress?.({ bytes: 1 });
			await mac.write(dest, 'x');
			return { ok: true, bytes: 1 };
		}
	};
	const engine = createTransferEngine({ provider, plan: [
		{ src: '/drive/ok.txt', dest: '/network/r/ok.txt', name: 'ok.txt' },
		{ src: '/drive/bad.txt', dest: '/network/r/bad.txt', name: 'bad.txt' }
	]});
	const first = await engine.start();
	assert.equal(first.done, 1);
	assert.equal(first.failed, 1);
	const bad = engine.items.find(item => item.name === 'bad.txt');
	assert.equal(bad.status, 'error');

	failBad = false;
	assert.equal(engine.retryFailed(), 1);
	const second = await engine.start();
	assert.equal(second.failed, 0);
	assert.equal(engine.items.filter(item => item.status === 'done').length, 2);
});

test('engine abort stops queued work and flags the run', async () => {
	const drive = mockVfs({ '/drive/1': 'a', '/drive/2': 'b', '/drive/3': 'c' });
	const mac = mockVfs({});
	const controller = new AbortController();
	const engine = createTransferEngine({
		provider: createVfsCopyProvider({ read: drive.read, write: mac.write }),
		plan: ['/drive/1', '/drive/2', '/drive/3'].map(key => ({ src: key, dest: `/network/r/${key.split('/').pop()}`, name: key })),
		concurrency: 1,
		signal: controller.signal,
		onFile: item => { if (item.name === '/drive/1' && item.status === 'done') controller.abort(); }
	});
	const final = await engine.start();
	assert.ok(final.done <= 1, `done=${final.done}`);
	const aborted = engine.items.filter(item => item.status === 'aborted');
	assert.ok(aborted.length >= 1, 'remaining items marked aborted');
});

test('engine requires a provider with copyFile', () => {
	assert.throws(() => createTransferEngine({}), /requires a provider/);
});

/* ---------- directions ---------- */

test('sendToMac resolves conflicts and copies drive -> mac', async () => {
	const drive = mockVfs({ '/drive/photo.jpg': 'img' });
	const mac = mockVfs({ '/network/r/photo.jpg': 'old' });
	const result = await sendToMac(
		[{ path: 'photo.jpg', name: 'photo.jpg' }],
		'',
		{ driveVfs: drive, macVfs: mac, route: 'r', concurrency: 2 }
	);
	assert.equal(result.done, 1);
	assert.equal(result.providerName, 'vfs-copy');
	assert.equal(mac.store['/network/r/photo (2).jpg'], 'img');
	assert.equal(mac.store['/network/r/photo.jpg'], 'old'); // never overwrites
});

test('sendToMac skips folders', async () => {
	const drive = mockVfs({});
	const mac = mockVfs({});
	const result = await sendToMac(
		[{ path: 'docs', name: 'docs', type: 'folder' }],
		'',
		{ driveVfs: drive, macVfs: mac, route: 'r' }
	);
	assert.equal(result.total, 0);
});

test('fetchFromMac copies mac -> drive with conflict-safe names', async () => {
	const drive = mockVfs({ '/drive/note.txt': 'existing' });
	const mac = mockVfs({ '/network/r/note.txt': 'from-mac' });
	const result = await fetchFromMac(
		[{ path: 'note.txt', name: 'note.txt' }],
		'',
		{ driveVfs: drive, macVfs: mac, route: 'r' }
	);
	assert.equal(result.done, 1);
	assert.equal(drive.store['/drive/note (2).txt'], 'from-mac');
});

test('sendToMac requires handles and a route', async () => {
	await assert.rejects(() => sendToMac([], '', {}), /requires \{ driveVfs, macVfs \}/);
	await assert.rejects(
		() => sendToMac([], '', { driveVfs: mockVfs({}), macVfs: mockVfs({}) }),
		/requires a Mac route/
	);
});

/* ---------- FolderPicker ---------- */

test('FolderPicker browses VFS folders with the DriveFolderChooser shape', async () => {
	const mac = mockVfs({
		'/network/r/docs/a.txt': 'x',
		'/network/r/photos/b.txt': 'y'
	});
	const seen = [];
	const picker = new FolderPicker({ vfs: mac, root: '/network/r', onChange: snapshot => seen.push(snapshot.path) });
	await picker.open('/network/r');
	assert.deepEqual(picker.snapshot().folders.map(folder => folder.name), ['docs', 'photos']);
	await picker.enter('/network/r/docs');
	assert.equal(picker.snapshot().path, '/network/r/docs');
	await picker.up();
	assert.equal(picker.snapshot().path, '/network/r');
	assert.ok(seen.length > 0);
});

test('FolderPicker stays inside its root', async () => {
	const mac = mockVfs({});
	const picker = new FolderPicker({ vfs: mac, root: '/network/r' });
	await picker.open('/network/r');
	await picker.enter('/etc');
	assert.equal(picker.snapshot().path, '/network/r');
});

test('FolderPicker createAndEnter fails clearly without mkdir', async () => {
	const mac = mockVfs({});
	const picker = new FolderPicker({ vfs: mac, root: '/network/r' });
	await picker.open('/network/r');
	await assert.rejects(() => picker.createAndEnter('new'), /does not support creating folders/);
});

/* ---------- dialog ---------- */

test('mountBridgeDialog requires a DOM container', () => {
	assert.throws(() => mountBridgeDialog(null, {}), /requires a browser DOM/);
	assert.throws(() => mountBridgeDialog({}, { macVfsFor: () => ({}), driveVfs: {} }), /requires a browser DOM/);
});
