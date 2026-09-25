//B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	CHAT_DRIVE_ACTIONS,
	CHAT_DRIVE_TOOL_DEFINITIONS,
	chatDriveActionMetadata,
	createChatDriveTools,
	isInScope,
	normalizeDrivePath,
	registerChatDriveTools
} from '../chatDriveTools.js';

function mockApi(log) {
	return {
		listFn: async (path) => { log.push(['list', path]); return [{ name: 'a.md', path: `${path}/a.md`, type: 'file' }]; },
		createFolderFn: async (parent, name) => { log.push(['mkdir', parent, name]); return { created: true }; },
		moveFn: async (from, to) => { log.push(['move', from, to]); return { moved: true }; },
		renameFn: async (path, name) => { log.push(['rename', path, name]); return { renamed: true }; },
		labelFn: async (path, label) => { log.push(['label', path, label]); return { labeled: true }; },
		searchFn: async (path, q) => { log.push(['search', path, q]); return [{ name: 'hit.md', path: `${path}/hit.md`, type: 'file' }]; },
		setSemanticNameFn: async (path, name) => { log.push(['semantic', path, name]); return { named: true }; }
	};
}

test('catalog: 7 definitions compile to immutable actions with metadata', () => {
	assert.equal(CHAT_DRIVE_TOOL_DEFINITIONS.length, 7);
	assert.equal(CHAT_DRIVE_ACTIONS.length, 7);
	assert.ok(Object.isFrozen(CHAT_DRIVE_ACTIONS[0]));
	const meta = chatDriveActionMetadata('chat.drive.list');
	assert.equal(meta.title, 'List scoped folder');
	assert.equal(meta.mutates, false);
	assert.equal(meta.replay, 'safe-read');
	const write = chatDriveActionMetadata('chat.drive.move');
	assert.equal(write.mutates, true);
	assert.equal(write.replay, 'reconcile-before-replay');
});

test('registerChatDriveTools: appends without duplicates or mutation', () => {
	const host = [{ name: 'other.tool' }];
	const merged = registerChatDriveTools(host);
	assert.equal(host.length, 1);
	assert.equal(merged.length, 8);
	const again = registerChatDriveTools(merged);
	assert.equal(again.length, 8, 'no duplicates on re-register');
});

test('scoping: tools cannot escape the folder', async () => {
	const log = [];
	const tools = createChatDriveTools('/drive/Projects/site', mockApi(log));
	const escapes = [
		() => tools['chat.drive.list']({ folderPath: '/drive/Other' }),
		() => tools['chat.drive.createFolder']({ name: 'x', folderPath: '/drive/Other' }),
		() => tools['chat.drive.move']({ from: '/drive/Projects/site/a', to: '/drive/Other/a' }),
		() => tools['chat.drive.move']({ from: '/drive/Other/a', to: '/drive/Projects/site/a' }),
		() => tools['chat.drive.rename']({ path: '/drive/Other/a', newName: 'b' }),
		() => tools['chat.drive.label']({ path: '/drive/Projects/../Other/a', label: 'x' }),
		() => tools['chat.drive.search']({ query: 'q', folderPath: '/drive' }),
		() => tools['chat.drive.setSemanticName']({ path: '/etc/passwd', semanticName: 'n' })
	];
	for (const attempt of escapes) {
		const r = await attempt();
		assert.equal(r.ok, false);
		assert.equal(r.error, 'chat_drive_scope_escape');
	}
	assert.deepEqual(log, [], 'no drive API call may fire on escape');
});

test('scoping: in-scope calls pass through and stay in scope', async () => {
	const log = [];
	const tools = createChatDriveTools('/drive/Projects/site', mockApi(log));
	const listed = await tools['chat.drive.list']({});
	assert.equal(listed.ok, true);
	assert.equal(listed.path, '/drive/Projects/site');
	const created = await tools['chat.drive.createFolder']({ name: 'assets', folderPath: '/drive/Projects/site/sub/../' });
	assert.equal(created.ok, true);
	assert.equal(created.path, '/drive/Projects/site/assets');
	assert.deepEqual(log[1], ['mkdir', '/drive/Projects/site', 'assets']);
});

test('scoping: /.. traversal is normalized back into the scope', async () => {
	const log = [];
	const tools = createChatDriveTools('/drive/Projects/site', mockApi(log));
	const r = await tools['chat.drive.rename']({ path: '/drive/Projects/site/docs/../notes.md', newName: 'n2.md' });
	assert.equal(r.ok, true);
	assert.equal(r.path, '/drive/Projects/site/notes.md');
});

test('createChatDriveTools: refuses unscoped root', () => {
	assert.throws(() => createChatDriveTools('/'), /refusing unscoped root/);
});

test('missing capability yields an honest error, not a throw', async () => {
	const tools = createChatDriveTools('/drive/Projects/site', {});
	const r = await tools['chat.drive.search']({ query: 'x' });
	assert.equal(r.ok, false);
	assert.equal(r.error, 'chat_drive_capability_missing');
});

test('isInScope / normalizeDrivePath edge cases', () => {
	assert.equal(normalizeDrivePath('/drive/a//b/../c'), '/drive/a/c');
	assert.equal(isInScope('/drive/a', '/drive/a'), true);
	assert.equal(isInScope('/drive/a', '/drive/a/b/c'), true);
	assert.equal(isInScope('/drive/a', '/drive/ab'), false, 'prefix sibling must not match');
	assert.equal(isInScope('/drive/a', '/drive/a/../b'), false);
});
