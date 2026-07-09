// B"H
import assert from 'node:assert/strict';
import { FeedCard } from './FeedCard.js';
const card = FeedCard({
  type:'announcement', title:'A gate opens', href:'/heichelos/ikar',
  authorAlias:'seeker', heichelId:'ikar', seriesId:'root',
  summary:'The same renderer feeds every chamber.',
  sections:[{ id:'a', label:'Opening', text:'A small verse appears in the preview.' }],
  counts:{ comments:2, reactions:5 }
});
const text = JSON.stringify(card);
for (const token of ['geelooy-feed-card-core','geelooy-character-avatar','character-robe','character-hat-brim','character-hat-crown','character-beard','character-peyos','data-read-more','A gate opens','Seeker','ikar','Read verses','2 comments','5 reactions']) assert.ok(text.includes(token), `FeedCard missing ${token}`);
assert.ok(!text.includes('Save'), 'FeedCard must not duplicate action rows');
assert.ok(!text.includes('geelooy-section-preview'), 'feed card must not duplicate verse body blocks');
const hidden = FeedCard({ title:'Answer', summary:'answer', authorAlias:'afmqsr5ra7_own', heichelId:'afmqsr5ra7_heich' });
const hiddenText = JSON.stringify(hidden);
assert.ok(hiddenText.includes('Geelooy User'), 'ugly ids should become readable names');
assert.ok(hiddenText.includes('Ikar'), 'ugly heichel ids should become readable room names');
console.log('B"H FeedCard.contract.test passed');
