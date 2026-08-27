// B"H
/**
 * Chapter 167: Universe store proof. Many entity types, recursive nodes,
 * children, graph edges, forks, snapshots, and DNA are verified against real
 * DosDB writes.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeEntity, getEntity, listEntities, addChild, getChildren, linkEntities, listEdges, snapshotEntity, forkEntity, getDna } = require('../universeStore.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-universe-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db };

const heichel = await writeEntity({ $i, input: { type: 'heichel', id: 'h1', title: 'Universe Heichel', aliasId: 'author', heichelId: 'h1' } });
assert.equal(heichel.success.type, 'heichel');

const post = await writeEntity({ $i, input: { type: 'post', id: 'p1', heichelId: 'h1', seriesId: 'root', aliasId: 'author', title: 'Recursive Post', content: 'Root light', nodes: [{ id: 'v1', type: 'verse', title: 'Verse', children: [{ id: 's1', type: 'subsection', content: 'Sub' }] }] } });
assert.equal(post.success.nodes[0].children[0].id, 's1');

const question = await writeEntity({ $i, input: { type: 'question', id: 'q1', heichelId: 'h1', aliasId: 'author', title: 'A question?', content: 'Question root' } });
const answer = await writeEntity({ $i, input: { type: 'answer', id: 'a1', heichelId: 'h1', aliasId: 'author', parentId: 'q1', title: 'An answer', content: 'Answer root' } });
await linkEntities({ $i, from: answer.success, to: question.success, kind: 'answers', actorAlias: 'author' });
assert.equal((await listEdges({ $i, entity: answer.success })).success[0].kind, 'answers');

const task = await addChild({ $i, parent: post.success, child: { type: 'task', id: 't1', heichelId: 'h1', aliasId: 'author', title: 'Polish section' } });
assert.equal(task.success.parentId, 'p1');
assert.equal((await getChildren({ $i, entity: post.success })).success[0].id, 't1');

const mail = await writeEntity({ $i, input: { type: 'mailThread', id: 'm1', aliasId: 'author', title: 'Private seed', content: 'May become public.' } });
await linkEntities({ $i, from: mail.success, to: post.success, kind: 'derivedFrom', note: 'mail became a post' });
assert.equal((await listEdges({ $i, entity: mail.success })).success[0].kind, 'derivedFrom');

const snap = await snapshotEntity({ $i, entity: post.success, label: 'First version' });
assert.ok(snap.success.id);
const fork = await forkEntity({ $i, entity: post.success, aliasId: 'student', title: 'Student Fork' });
assert.equal(fork.success.parentId, 'p1');

const dna = await getDna({ $i, entity: post.success });
assert.ok(dna.success.contentNodes.includes('v1'));
assert.ok(dna.success.descendants.includes('t1'));
assert.ok(dna.success.timeline.length >= 1);
assert.ok(dna.success.forks.includes(fork.success.id));
assert.ok((await getEntity({ $i, type: 'post', id: 'p1' })).success.title.includes('Recursive'));
assert.ok((await listEntities({ $i, heichelId: 'h1' })).success.length >= 4);
assert.ok((await listEntities({ $i, aliasId: 'author' })).success.length >= 5);
console.log('B"H universeStore.test passed');
