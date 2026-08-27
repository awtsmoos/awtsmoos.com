// B"H
/**
 * Chapter 135: structured editor, governance, and asset helpers.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../ayzarim/DosDB/index.js');
const { normalizePostDraft, toContentSections } = require('../helper/editor/postSchema.js');
const { saveDraft, publishDraft } = require('../helper/editor/postDrafts.js');
const { setRole, roleOf } = require('../helper/governance/roles.js');
const { submitPost, reviewSubmission, publishSubmission } = require('../helper/governance/submissions.js');
const { uploadAssets } = require('../helper/assets/assetUpload.js');
const { parseMultipart } = require('../helper/assets/multipart.js');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-editor-assets-'));
const db = new DosDB(dir);
await db.init();
const owner = 'owner_alias';
const contributor = 'contrib_alias';
const heichelId = 'h_editor';
await db.write(`/users/u1/aliases/${owner}`, { aliasId: owner });
await db.write(`/social/aliases/${owner}/info`, { name: 'Owner', user: 'u1' });
await db.write(`/social/heichelos/${heichelId}/info`, { name: 'Editor Heichel', author: owner });

const draft = normalizePostDraft({ aliasId: owner, heichelId, seriesId: 'root', title: 'Structured', description: 'Root', verses: JSON.stringify([{ label: 'Alef', text: 'Verse text', assets: [{ id: 'assetA' }], subsections: [{ title: 'Inner', text: 'Sub text', assets: [{ id: 'assetB' }] }] }]) });
assert.equal(draft.verses[0].subsections[0].title, 'Inner');
assert.equal(toContentSections(draft)[0].segments[0].assets[0].id, 'assetB');

let $i = { db, $_POST: { ...draft, verses: JSON.stringify(draft.verses) } };
const saved = await saveDraft({ $i });
assert.ok(saved.success.id, 'draft id missing');
$i = { db, $_POST: { aliasId: owner, draftId: saved.success.id } };
const published = await publishDraft({ $i });
assert.equal(published.success.post.sections[0].segments[0].content, 'Sub text');

await setRole({ $i: { db }, heichelId, aliasId: contributor, role: 'contributor', actorAlias: owner });
assert.equal(await roleOf({ $i: { db }, heichelId, aliasId: contributor }), 'contributor');
const submission = await submitPost({ $i: { db, $_POST: { aliasId: contributor, title: 'Submitted', seriesId: 'root', content: 'Needs review', sections: JSON.stringify([{ title: 'V', content: 'Text' }]) } }, heichelId, actorAlias: contributor });
assert.equal(submission.success.status, 'submitted');
const approved = await reviewSubmission({ $i: { db, $_POST: {} }, heichelId, submissionId: submission.success.id, actorAlias: owner, status: 'approved' });
assert.equal(approved.success.status, 'approved');
const pub = await publishSubmission({ $i: { db, $_POST: {} }, heichelId, submissionId: submission.success.id, actorAlias: owner });
assert.ok(pub.success.post.postId, 'published submission post missing');

const boundary = 'BHBOUNDARY';
const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);
const raw = Buffer.concat([
  Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="attachKind"\r\n\r\nverse\r\n`),
  Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="tiny.png"\r\nContent-Type: image/png\r\n\r\n`),
  image,
  Buffer.from(`\r\n--${boundary}--\r\n`)
]);
const parsed = parseMultipart({ request: { headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } }, $_POST: { __raw_body__: raw } });
assert.equal(parsed.files[0].mime, 'image/png');
const asset = await uploadAssets({ $i: { db, request: { headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } }, $_POST: { __raw_body__: raw } }, userid: 'u1', aliasId: owner });
assert.equal(asset.success[0].type, 'image');
assert.ok(fs.existsSync(asset.success[0].storagePath), 'asset file missing');
console.log('B"H editorAssetsGovernance.test passed');
