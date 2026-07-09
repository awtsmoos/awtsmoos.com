// B"H
import assert from 'node:assert/strict';
import { FeedCard } from './FeedCard.js';
const card = FeedCard({
  type: 'announcement', title: 'A gate opens', href: '/heichelos/ikar',
  authorAlias: 'seeker', heichelId: 'ikar', seriesId: 'root',
  summary: 'The same renderer feeds every chamber.',
  assets: [{ label: 'image' }],
  sections: [{ id: 'a', label: 'Opening', text: 'A small verse appears in the preview.' }],
  counts: { comments: 2, reactions: 5 }
});
const text = JSON.stringify(card);
for (const token of ['geelooy-feed-card-core', 'geelooy-section-preview', 'data-read-more', 'A gate opens', 'seeker', 'ikar', 'Series: root', 'image', 'Verse 1', 'Opening', 'Comment (2)', 'Share · 5']) assert.ok(text.includes(token), `FeedCard missing ${token}`);
console.log('B"H FeedCard.contract.test passed');
