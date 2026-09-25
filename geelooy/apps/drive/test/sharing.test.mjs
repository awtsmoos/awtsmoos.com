//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PUBLIC_SERVE_BASE,
	SHARE_KEY,
	SHARE_MODES,
	copyShareLink,
	getShare,
	makePreviewLink,
	normalizeShare,
	setShare,
	validateShare
} from '../js/sharing.js';

function memStore() {
	const map = new Map();
	return {
		async getMetadata(path) { return map.get(path) || {}; },
		async updateMetadata(path, patch) { map.set(path, { ...(map.get(path) || {}), ...patch }); }
	};
}

test('normalizeShare defaults unknown modes to private', () => {
	assert.equal(normalizeShare(null).mode, 'private');
	assert.equal(normalizeShare({ mode: 'everyone' }).mode, 'private');
	assert.deepEqual(normalizeShare({ mode: 'members', members: ['a@x', 'a@x', ' ', 'b@x'] }).members, ['a@x', 'b@x']);
});

test('validateShare accepts clean records for each mode', () => {
	for (const mode of SHARE_MODES) {
		const share = mode === 'members' ? { mode, members: ['yaakov'] } : { mode };
		const checked = validateShare(share, '/Sites/demo');
		assert.equal(checked.ok, true, mode);
	}
});

test('validateShare rejects members mode with no members', () => {
	const checked = validateShare({ mode: 'members', members: [] });
	assert.equal(checked.ok, false);
	assert.match(checked.errors.join(' '), /at least one member/);
});

test('validateShare derives a publicId for public mode', () => {
	const checked = validateShare({ mode: 'public' }, '/Sites/My Demo!');
	assert.equal(checked.ok, true);
	assert.equal(checked.share.publicId, 'my-demo');
});

test('validateShare rejects bad publicId values', () => {
	const checked = validateShare({ mode: 'public', publicId: 'UPPER CASE!!' });
	assert.equal(checked.ok, false);
	assert.match(checked.errors.join(' '), /publicId/);
});

test('setShare throws on invalid records and never persists them', async () => {
	const metadata = memStore();
	await assert.rejects(() => setShare('/f', { mode: 'members', members: [] }, { metadata }), /at least one member/);
	assert.deepEqual(await metadata.getMetadata('/f'), {});
});

test('getShare/setShare round-trip through the metadata contract', async () => {
	const metadata = memStore();
	const saved = await setShare('/Sites/demo', { mode: 'members', members: ['yaakov', 'miriam'] }, { metadata });
	assert.equal(saved.mode, 'members');
	assert.ok(saved.updatedAt);
	const read = await getShare('/Sites/demo', { metadata });
	assert.deepEqual(read.members, ['yaakov', 'miriam']);
	assert.equal(read.updatedAt, saved.updatedAt);
});

test('mode transitions private -> members -> public keep members intact', async () => {
	const metadata = memStore();
	await setShare('/f', { mode: 'members', members: ['a'] }, { metadata });
	await setShare('/f', { mode: 'public' }, { metadata });
	const read = await getShare('/f', { metadata });
	assert.equal(read.mode, 'public');
	assert.deepEqual(read.members, ['a']);
	assert.ok(read.publicId);
});

test('makePreviewLink builds the canonical public serving URL', () => {
	const url = makePreviewLink('/Sites/demo', { alias: 'awtsmoos' });
	assert.equal(url, `${PUBLIC_SERVE_BASE}/awtsmoos/Sites/demo/index.html`);
});

test('makePreviewLink encodes path segments and honors a publicUrl builder', () => {
	const viaBuilder = makePreviewLink('/My Site', { publicUrl: path => `https://cdn.example/${path}` });
	assert.equal(viaBuilder, 'https://cdn.example/My Site/index.html');
	const viaAlias = makePreviewLink('/My Site', { alias: 'awtsmoos' });
	assert.equal(viaAlias, `${PUBLIC_SERVE_BASE}/awtsmoos/My%20Site/index.html`);
	assert.throws(() => makePreviewLink('/x'), /alias or a publicUrl/);
});

test('copyShareLink degrades gracefully without a clipboard', async () => {
	const result = await copyShareLink('/Sites/demo', { alias: 'awtsmoos' });
	assert.equal(result.ok, false);
	assert.equal(result.method, 'none');
	assert.ok(result.url.startsWith(PUBLIC_SERVE_BASE));
});

test('copyShareLink uses the clipboard API when present', async () => {
	let written = null;
	Object.defineProperty(globalThis, 'navigator', {
		value: { clipboard: { writeText: async text => { written = text; } } },
		configurable: true
	});
	try {
		const result = await copyShareLink('/Sites/demo', { alias: 'awtsmoos' });
		assert.equal(result.ok, true);
		assert.equal(result.method, 'clipboard');
		assert.equal(written, result.url);
	} finally {
		delete globalThis.navigator;
	}
});

test('SHARE_KEY matches the metadata contract key', () => {
	assert.equal(SHARE_KEY, 'share');
});
