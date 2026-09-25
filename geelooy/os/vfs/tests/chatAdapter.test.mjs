//B"H
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	chatAdapter,
	createMemoryChatStore,
	chatDatePath,
	chatEntityRef,
	renderTranscript
} from '../chatAdapter.js';

function seedStore() {
	return createMemoryChatStore({
		chats: [
			{
				summary: {
					id: 'chat-1',
					title: 'Design the invoice flow',
					createdAt: '2026-09-20T10:00:00.000Z',
					updatedAt: '2026-09-20T11:00:00.000Z',
					messageCount: 4,
					summary: 'We decided invoices go out on Fridays.'
				},
				transcript: [
					{ role: 'user', text: 'How should invoices work?', at: '2026-09-20T10:00:00.000Z' },
					{ role: 'assistant', text: 'Fridays. Always Fridays.', at: '2026-09-20T10:01:00.000Z' }
				],
				touchedFiles: [
					{ path: '/drive/Projects/invoices/plan.md', label: 'plan', note: 'drafted the schedule' }
				]
			},
			{
				summary: {
					id: 'chat-2',
					title: 'Shopping list',
					createdAt: '2026-08-02T09:00:00.000Z',
					updatedAt: '2026-08-02T09:05:00.000Z',
					messageCount: 2
				},
				transcript: [{ role: 'user', text: 'milk' }],
				touchedFiles: []
			}
		],
		labels: { work: ['chat-1'] },
		shortcuts: { invoices: 'chat-1' }
	});
}

test('layout: /Chats lists year folders plus _labels and _shortcuts', async () => {
	const a = chatAdapter(seedStore());
	const names = (await a.list('/Chats')).map(n => n.name).sort();
	assert.deepEqual(names, ['2026', '_labels', '_shortcuts']);
});

test('layout: YYYY/MM/DD drill-down reaches the chat folder', async () => {
	const a = chatAdapter(seedStore());
	const months = await a.list('/Chats/2026');
	assert.deepEqual(months.map(n => n.name), ['08', '09']);
	const days = await a.list('/Chats/2026/09');
	assert.deepEqual(days.map(n => n.name), ['20']);
	const chats = await a.list('/Chats/2026/09/20');
	assert.deepEqual(chats.map(n => n.name), ['design-the-invoice-flow']);
	assert.equal(chats[0].data.entity, 'awts://entity/chat/chat-1');
});

test('layout: chat folder contains transcript.md, summary.md, files/', async () => {
	const a = chatAdapter(seedStore());
	const kids = (await a.list('/Chats/2026/09/20/design-the-invoice-flow')).map(n => n.name).sort();
	assert.deepEqual(kids, ['files', 'summary.md', 'transcript.md']);
});

test('read: transcript.md renders messages with absolute path and entity ref', async () => {
	const a = chatAdapter(seedStore());
	const r = await a.read('/Chats/2026/09/20/design-the-invoice-flow/transcript.md');
	assert.equal(r.ok, true);
	assert.match(r.content, /Design the invoice flow/);
	assert.match(r.content, /## User/);
	assert.match(r.content, /## Assistant/);
	assert.match(r.content, /Fridays\. Always Fridays\./);
	assert.match(r.content, /\/Chats\/2026\/09\/20\/design-the-invoice-flow/);
	assert.match(r.content, /awts:\/\/entity\/chat\/chat-1/);
});

test('read: summary.md renders the recorded summary', async () => {
	const a = chatAdapter(seedStore());
	const r = await a.read('/Chats/2026/09/20/design-the-invoice-flow/summary.md');
	assert.equal(r.ok, true);
	assert.match(r.content, /invoices go out on Fridays/);
});

test('read: files/ lists touched files as read-only pointers', async () => {
	const a = chatAdapter(seedStore());
	const files = await a.list('/Chats/2026/09/20/design-the-invoice-flow/files');
	assert.equal(files.length, 1);
	assert.equal(files[0].data.canonicalPath, '/drive/Projects/invoices/plan.md');
	const r = await a.read(files[0].path);
	assert.equal(r.ok, true);
	assert.match(r.content, /\/drive\/Projects\/invoices\/plan\.md/);
	assert.match(r.content, /read-only pointer/);
});

test('read-only: write/move/copy/remove/mkdir/watch are rejected', async () => {
	const a = chatAdapter(seedStore());
	for (const method of ['write', 'mkdir', 'remove', 'move', 'copy', 'watch']) {
		const r = await a[method]('/Chats/2026/09/20/design-the-invoice-flow/transcript.md');
		assert.equal(r.ok, false, method);
		assert.match(r.error, new RegExp(`vfs_${method}_not_implemented`), method);
	}
});

test('labels: /Chats/_labels/<label>/<chat> link nodes point at chat folders', async () => {
	const a = chatAdapter(seedStore());
	const labels = await a.list('/Chats/_labels');
	assert.deepEqual(labels.map(n => n.name), ['work']);
	const chats = await a.list('/Chats/_labels/work');
	assert.equal(chats.length, 1);
	assert.equal(chats[0].type, 'link');
	assert.equal(chats[0].data.target, '/Chats/2026/09/20/design-the-invoice-flow');
	assert.equal(chats[0].data.entity, 'awts://entity/chat/chat-1');
});

test('shortcuts: /Chats/_shortcuts/<name> link nodes point at chat folders', async () => {
	const a = chatAdapter(seedStore());
	const names = await a.list('/Chats/_shortcuts');
	assert.deepEqual(names.map(n => n.name), ['invoices']);
	assert.equal(names[0].type, 'link');
	assert.equal(names[0].data.target, '/Chats/2026/09/20/design-the-invoice-flow');
});

test('store: setChatLabel / createChatShortcut are visible through the adapter', async () => {
	const store = seedStore();
	await store.setChatLabel('chat-2', 'personal');
	await store.createChatShortcut('groceries', 'chat-2');
	const a = chatAdapter(store);
	const labels = (await a.list('/Chats/_labels')).map(n => n.name).sort();
	assert.deepEqual(labels, ['personal', 'work']);
	const shortcuts = (await a.list('/Chats/_shortcuts')).map(n => n.name).sort();
	assert.deepEqual(shortcuts, ['groceries', 'invoices']);
});

test('search: query returns matching chat folders', async () => {
	const a = chatAdapter(seedStore());
	const hits = await a.search('invoice');
	assert.equal(hits.length, 1);
	assert.equal(hits[0].path, '/Chats/2026/09/20/design-the-invoice-flow');
	const none = await a.search('zzz-no-such-chat');
	assert.deepEqual(none, []);
});

test('stat: root, folder, file and unknown paths', async () => {
	const a = chatAdapter(seedStore());
	const root = await a.stat('/Chats');
	assert.equal(root.ok, true);
	assert.equal(root.node.type, 'folder');
	const file = await a.stat('/Chats/2026/09/20/design-the-invoice-flow/transcript.md');
	assert.equal(file.ok, true);
	assert.equal(file.node.type, 'file');
	const missing = await a.stat('/Chats/1999/01/01');
	assert.equal(missing.ok, false);
});

test('helpers: chatDatePath and chatEntityRef are absolute and stable', () => {
	const chat = { id: 'abc', title: 'Hello World!', createdAt: '2026-09-20T00:00:00.000Z' };
	assert.equal(chatDatePath(chat), '/Chats/2026/09/20/hello-world');
	assert.equal(chatEntityRef(chat), 'awts://entity/chat/abc');
});

test('renderTranscript: empty transcript still renders header metadata', () => {
	const out = renderTranscript({ id: 'x', title: 'Empty', createdAt: '2026-01-01T00:00:00.000Z' }, []);
	assert.match(out, /# Empty/);
	assert.match(out, /awts:\/\/entity\/chat\/x/);
});
