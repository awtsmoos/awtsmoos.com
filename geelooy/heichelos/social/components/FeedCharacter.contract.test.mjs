// B"H
import assert from 'node:assert/strict';
import { FeedCharacter } from './FeedCharacter.js';
const text = JSON.stringify(FeedCharacter({ name:'Maya Stern', seed:'maya' }));
for (const token of ['geelooy-character-avatar','character-aura','character-shadow','character-robe','character-lapel left','character-belt','character-leg left','character-shoe right','character-hand left','character-neck','character-head','character-ear right','character-hair','character-peyos left','character-hat-brim','character-hat-crown','character-eye left','character-brow right','character-nose','character-moustache','character-beard','character-smile']) assert.ok(text.includes(token), `FeedCharacter missing ${token}`);
assert.ok(!text.includes('character-initials'), 'character avatar should not fall back to text initials');
console.log('B"H FeedCharacter.contract.test passed');
