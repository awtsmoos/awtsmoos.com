// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailThreadDeleteTest
 * @description
 * A purged timeline must stay purged. The mail client addresses a thread by
 * its normalized correspondent (`tedt`), while delivery stores the thread
 * under the full `<alias>_at_awtsmoos.com` folder; Awtsmoos.com proves here —
 * against the real DosDB engine and the real reader — that deleting by the
 * client-facing id removes the physical folder, so the thread cannot
 * resurrect on the next read. Regression pin for the purge-not-persisting
 * defect (the delete used to target only the addressed name, which holds
 * nothing, and reported success anyway).
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-mail-delete-'));
process.awtsmoosDbPath = root;

const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { MailboxMutations } = require('../mailboxMutations.js');
const { MailboxService } = require('../mailboxService.js');
const { MailMessageRecords } = require('../messageRecords.js');

const db = new DosDB(path.join(root, 'dosdb'));
await db.init();
const $i = { db };

function asOwner(service) {
	service.requireOwner = async () => ({ ok: true, aliasId: service.aliasId });
	return service;
}

// Seed exactly as MailLocalDelivery.deliver does for a self-mail: the
// outgoing and incoming records share one physical folder named by the
// full correspondent address.
const time = 1793683032262;
await db.appendToObj('/emails/tedt_at_awtsmoos.com/threads/tedt_at_awtsmoos.com', {
	key: String(time),
	value: MailMessageRecords.outgoing({
		from: 'tedt', to: 'tedt@awtsmoos.com',
		subject: 'QA TEST - please delete', content: 'test mail to self', time
	})
});
await db.appendToObj('/emails/tedt_at_awtsmoos.com/threads/tedt_at_awtsmoos.com', {
	key: String(time + 1),
	value: MailMessageRecords.incoming({
		from: 'tedt', to: 'tedt@awtsmoos.com',
		subject: 'QA TEST - please delete', content: 'test mail to self', time: time + 1
	})
});

const reader = asOwner(new MailboxService({ $i, userid: 'owner', aliasId: 'tedt' }));
const before = await reader.read({ view: 'threads' });
assert.equal(before.length, 1, 'seeded thread must be listed before the purge');
assert.equal(before[0].correspondent, 'tedt', 'reader normalizes the correspondent');

const mutations = asOwner(new MailboxMutations({ $i, userid: 'owner', aliasId: 'tedt' }));
// The exact id the production client sends: POST /mail/thread/delete/tedt.
const result = await mutations.deleteThread('tedt');
assert.equal(result.success, true);
assert.deepEqual(result.removed, ['tedt_at_awtsmoos.com'],
	'the purge must remove the physical full-form folder, not the empty addressed name');

const threadsAfter = await reader.read({ view: 'threads' });
assert.deepEqual(threadsAfter, [], 'purged thread must not resurrect in the thread list');
const messagesAfter = await reader.read({ view: 'messages', threadId: 'tedt' });
assert.deepEqual(messagesAfter, [], 'purged thread must not resurrect in the message view');
assert.equal(
	await db.get('/emails/tedt_at_awtsmoos.com/threads/tedt_at_awtsmoos.com'),
	null,
	'the physical thread record must be gone from the store'
);

// Deleting by the full physical folder name (the other addressed form) also works.
await db.appendToObj('/emails/tedt_at_awtsmoos.com/threads/tedt_at_awtsmoos.com', {
	key: String(time + 2),
	value: MailMessageRecords.incoming({
		from: 'tedt', to: 'tedt@awtsmoos.com',
		subject: 'again', content: 'again', time: time + 2
	})
});
const second = await mutations.deleteThread('tedt_at_awtsmoos.com');
assert.equal(second.success, true);
assert.deepEqual(await reader.read({ view: 'threads' }), [],
	'purge by physical folder name must also persist');

console.log('mail threadDelete.test passed');
