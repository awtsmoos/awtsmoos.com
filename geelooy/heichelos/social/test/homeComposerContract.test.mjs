//B"H
import assert from 'node:assert/strict';
import { createDraft, addTargetHeichel, addAssetToVerse, toPostPayload } from '../composer/composerDraft.js';
let draft = createDraft({ aliasId: 'me', profileHeichelId: 'profile-me', title: 'Home post', verses: [{ id: 'v1', verseSection: 'v1', title: 'Verse', body: 'Root', subsections: [{ id: 's1', content: 'Subsection' }] }] });
assert.equal(draft.heichelId, 'profile-me');
assert.equal(draft.targets[0].heichelId, 'profile-me');
draft = addTargetHeichel(draft, { heichelId: 'community-open', label: 'Community Open' });
draft = addAssetToVerse(draft, 'v1', { id: 'img1', type: 'image', publicPath: '/img.png' });
const payload = toPostPayload(draft);
assert.deepEqual(payload.targetHeichelIds, ['profile-me', 'community-open']);
const sections = JSON.parse(payload.sections);
assert.equal(sections[0].verseSection, 'v1');
assert.equal(sections[0].assets[0].publicPath, '/img.png');
assert.equal(sections[0].segments[0].id, 's1');
console.log('B"H homeComposerContract.test passed');
