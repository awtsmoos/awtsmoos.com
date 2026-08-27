// B"H
/**
 * Chapter 177: Mail universe proof. A mail thread mirrors into the recursive
 * entity universe and can link to a post without disturbing the original mail
 * endpoints.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeEntity, listEdges } = require('../../entityUniverse/universeStore.js');
const { mirrorMailThread, linkMailThreadToEntity } = require('../mailUniverse.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-mail-universe-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db };
const post = (await writeEntity({ $i, input: { type: 'post', id: 'mail_post', heichelId: 'mail_h', aliasId: 'rambam', title: 'From Mail', content: 'Root' } })).success;
const mail = await mirrorMailThread({ $i, thread: { id: 'thread_1', aliasId: 'rambam', subject: 'Deep private exchange', preview: 'seed', messages: [{ id: 'm1', from: 'rambam', body: 'First' }, { id: 'm2', from: 'raavad', body: 'Second' }] } });
assert.equal(mail.success.type, 'mailThread');
assert.equal(mail.success.nodes.length, 2);
const linked = await linkMailThreadToEntity({ $i, threadId: 'thread_1', target: post, actorAlias: 'rambam' });
assert.equal(linked.success.kind, 'derivedFrom');
assert.equal((await listEdges({ $i, entity: mail.success })).success[0].to.id, 'mail_post');
console.log('B"H mailUniverse.test passed');
