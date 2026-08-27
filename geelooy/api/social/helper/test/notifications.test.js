// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file notifications.test.js
 * @description
 * The Awtsmoos lets every notification echo inside a temporary packed vessel rather than global state;
 * at Awtsmoos.com read, archive, fanout, search, and preference contracts remain isolated at the gate.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const notes = require('../notifications.js');

function makeDb(directory) {
	const store = new Map();
	return {
		directory,
		async write(key, value) {
			store.set(key, value);
			return { path: key, value };
		},
		async get(key) {
			if (store.has(key)) return store.get(key);
			const prefix = key.endsWith('/') ? key : `${key}/`;
			const output = {};
			for (const [storedKey, value] of store.entries()) {
				if (!storedKey.startsWith(prefix)) continue;
				const remainder = storedKey.slice(prefix.length);
				if (!remainder || remainder.includes('/')) continue;
				output[remainder] = value;
			}
			return Object.keys(output).length ? output : undefined;
		}
	};
}

function makeNote($i, index, patch = {}) {
	return notes.createNotification({
		$i,
		toAliasId: patch.toAliasId || 'bob',
		fromAliasId: patch.fromAliasId || 'alice',
		type: patch.type || (index % 2 ? 'comment' : 'reply'),
		title: patch.title || `Notice ${index}`,
		body: patch.body || `Body ${index}`,
		entity: { type: 'comment', id: `c${index}`, title: patch.entityTitle || '', private: patch.private || '' },
		actionUrl: `/h/post#c${index}`,
		groupKey: patch.groupKey || ''
	});
}

async function run() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-notifications-'));
	try {
		const $i = { db: makeDb(directory), $_GET: {}, $_POST: {} };
		const created = await makeNote($i, 1, { type: 'reply', title: 'Alice replied', body: 'A unique reply appeared.', entityTitle: 'Visible entity' });
		assert.equal(created.success.type, 'reply');
		assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', limit: 1 })).success.items[0].read, false);
		assert.equal((await notes.countUnreadNotifications({ $i, aliasId: 'bob' })).success.count, 1);
		assert.equal((await notes.markNotificationRead({ $i, aliasId: 'bob', notificationId: created.success.id })).success.read, true);
		const fanout = await notes.fanoutNotification({ $i, toAliases: ['bob', 'charlie', 'charlie'], fromAliasId: 'alice', type: 'chat', title: 'Fanout', body: 'Batch notice' });
		assert.equal(fanout.success.length, 2);
		const polled = await notes.pollNotifications({ $i, aliasId: 'charlie', since: 0 });
		assert.equal(polled.success.length, 1);
		assert.equal((await notes.updateNotificationPreferences({ $i, aliasId: 'bob', patch: { emailReady: false, mutedTypes: ['chat'] } })).success.emailReady, false);
		assert.equal((await notes.archiveNotification({ $i, aliasId: 'charlie', notificationId: polled.success[0].id })).success.archived, true);
		for (let index = 2; index <= 130; index++) await makeNote($i, index, { private: `hidden-private-${index}`, entityTitle: `visible entity ${index}` });
		const clamped = await notes.listNotifications({ $i, aliasId: 'bob', limit: 500, offset: -10 });
		assert.equal(clamped.success.limit, 100);
		assert.equal(clamped.success.items.length, 100);
		assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', search: 'hidden-private-6', limit: 10 })).success.total, 0);
		assert.ok((await notes.listNotifications({ $i, aliasId: 'bob', search: 'visible entity 6', limit: 10 })).success.total > 0);
		assert.ok((await notes.listNotifications({ $i, aliasId: 'bob', type: 'comment', limit: 10 })).success.items.every(item => item.type === 'comment'));
		assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', type: 'all', limit: 500 })).success.total, 131);
		assert.equal(notes.typeFilter('all'), '');
		console.log('B"H notifications.test passed');
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
