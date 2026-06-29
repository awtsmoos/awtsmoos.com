// B"H
import assert from 'node:assert/strict';
import { createRumor, spreadRumor } from '../../ckidsAwtsmoos/systems/npc/GossipRuntime.js';
let r=createRumor('miriam_baker','The player delivered bread.','bread_delivery');
for(const id of ['a','b','c','d','e','f','g','h','i','j']) r=spreadRumor(r,id);
assert.equal(r.spreadCount,10);
assert.match(r.currentText,/blessing/);
console.log('rumorPropagationSmoke passed');
