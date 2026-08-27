// B"H
/**
 * Chapter 174: Living social stress proof. This creates multiple heichelos,
 * aliases, many posts/questions/answers/mail-thread entities, nested comments,
 * replies, cross-entity references, and range references from one post's verse
 * tree into another post while preserving source comment URLs.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require(path.resolve('ayzarim/DosDB/index.js'));
const { writeEntity, getEntity, linkEntities, listEntities, getDna } = require('../universeStore.js');
const { resolveRangeReference, attachRangeReference } = require('../rangeReferences.js');
const { createComment, getTree } = require('../../comments/richCommentStore.js');

const dbRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-network-stress-'));
const db = new DosDB(dbRoot);
await db.init();
const $i = { db, $_POST: {}, $_GET: {}, request: { headers: {} } };
const aliases = ['rambam', 'raavad', 'maggid', 'kesef', 'lechem'];
const heichelos = ['halacha', 'chassidus', 'nigleh'];

for (const [index, alias] of aliases.entries()) {
  await db.write(`/users/u${index}/aliases/${alias}`, { aliasId: alias });
  await db.write(`/social/aliases/${alias}/info`, { user: `u${index}`, name: alias });
}
for (const heichel of heichelos) await writeEntity({ $i, input: { type: 'heichel', id: heichel, heichelId: heichel, aliasId: aliases[0], title: `Heichel ${heichel}` } });

const posts = [];
for (let i = 0; i < 18; i++) {
  posts.push((await writeEntity({ $i, input: {
    type: 'post', id: `post_${i}`, heichelId: heichelos[i % heichelos.length], seriesId: `series_${i % 4}`, aliasId: aliases[i % aliases.length], title: `Post ${i}`, content: `Root ${i}`,
    nodes: [0, 1, 2].map(v => ({ id: `v${v}`, type: 'verse', title: `Verse ${v}`, content: `Post ${i} verse ${v}`, children: [0, 1].map(s => ({ id: `v${v}_s${s}`, type: 'subsection', content: `Post ${i} verse ${v} sub ${s}` })) }))
  } })).success);
}

const questions = [];
const answers = [];
for (let i = 0; i < 6; i++) {
  const q = (await writeEntity({ $i, input: { type: 'question', id: `q_${i}`, heichelId: heichelos[i % heichelos.length], aliasId: aliases[i % aliases.length], title: `Question ${i}`, content: `What about ${i}?` } })).success;
  questions.push(q);
  const a = (await writeEntity({ $i, input: { type: 'answer', id: `a_${i}`, heichelId: q.heichelId, aliasId: aliases[(i + 1) % aliases.length], parentId: q.id, title: `Answer ${i}`, content: `Answering ${i}` } })).success;
  answers.push(a);
  await linkEntities({ $i, from: a, to: q, kind: 'answers', actorAlias: a.aliasId });
}

const mail = (await writeEntity({ $i, input: { type: 'mailThread', id: 'mail_seed_1', aliasId: 'rambam', title: 'Private mail seed', content: 'This private exchange becomes a public source.' } })).success;
await linkEntities({ $i, from: mail, to: posts[0], kind: 'derivedFrom', note: 'mail seeded post' });

let commentCount = 0;
let replyCount = 0;
for (const entity of [...posts.slice(0, 12), ...questions, ...answers]) {
  for (let i = 0; i < 2; i++) {
    const alias = aliases[(i + commentCount) % aliases.length];
    $i.$_POST = { aliasId: alias, content: `Comment ${commentCount} on ${entity.id}`, verseSection: entity.nodes?.[0]?.id || 'root', links: JSON.stringify([{ kind: 'post', postId: posts[(commentCount + 1) % posts.length].id, label: 'linked post' }]) };
    const c = await createComment({ $i, userid: `u${aliases.indexOf(alias)}`, heichelId: entity.heichelId || 'halacha', postId: entity.id, aliasId: alias });
    assert.ok(c.success.url.includes(c.success.id));
    commentCount++;
    const replyAlias = aliases[(i + 2) % aliases.length];
    $i.$_POST = { aliasId: replyAlias, content: `Reply ${replyCount}`, links: JSON.stringify([{ kind: 'comment', commentId: c.success.id, label: 'parent' }]) };
    const r = await createComment({ $i, userid: `u${aliases.indexOf(replyAlias)}`, heichelId: entity.heichelId || 'halacha', postId: entity.id, parentId: c.success.id, aliasId: replyAlias });
    assert.equal(r.success.parentId, c.success.id);
    replyCount++;
  }
}

const range = await resolveRangeReference({ $i, reference: { source: { type: 'post', id: 'post_0' }, startNodeId: 'v1', limit: 4 } });
assert.ok(range.success.nodes.length >= 1);
assert.equal(range.success.nodes[0].sourceCommentPointer.postId, 'post_0');
assert.ok(range.success.nodes[0].sourceCommentPointer.commentTreeUrl.includes('post_0'));
const attached = await attachRangeReference({ $i, target: { type: 'post', id: 'post_5' }, reference: { source: { type: 'post', id: 'post_0' }, startNodeId: 'v1', limit: 4 } });
assert.ok(attached.success.insertedNode.options.liveReference);
assert.ok(attached.success.insertedNode.children[0].options.sourceCommentPointer.commentTreeUrl.includes('post_0'));

await linkEntities({ $i, from: posts[5], to: questions[0], kind: 'respondsTo', actorAlias: posts[5].aliasId });
await linkEntities({ $i, from: posts[7], to: posts[5], kind: 'supports', actorAlias: posts[7].aliasId });
const tree = await getTree({ $i, heichelId: posts[0].heichelId, postId: posts[0].id });
assert.ok(tree.success[0].replies.length >= 1);
const dna = await getDna({ $i, entity: posts[5] });
assert.ok(dna.success.references.length >= 1, 'attached range should create graph reference');
assert.ok((await listEntities({ $i, heichelId: 'halacha' })).success.length >= 8);
assert.ok((await listEntities({ $i, aliasId: 'rambam' })).success.length >= 5);
assert.equal((await getEntity({ $i, type: 'mailThread', id: 'mail_seed_1' })).success.title, 'Private mail seed');
console.log('B"H universeStressNetwork.test passed', JSON.stringify({ posts: posts.length, questions: questions.length, answers: answers.length, comments: commentCount, replies: replyCount }, null, 2));
