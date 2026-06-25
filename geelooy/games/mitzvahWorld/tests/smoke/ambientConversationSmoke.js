// B"H
import assert from 'node:assert/strict';
import { composeAmbientConversation } from '../../ckidsAwtsmoos/systems/dialog/AmbientConversationRuntime.js';
const store={ npcs:[{id:'miriam_baker',name:'Miriam'},{id:'tova_child',name:'Tova'}], economy:{ bread:0 }, familyTrust:{ tova_child:2 }, eventFeed:[] };
const row=composeAmbientConversation(store,'miriam_baker','tova_child');
assert.match(row.text,/kindness|Bread|village/,'ambient text references world state');
assert.equal(store.ambientConversations.length,1,'conversation row stored');
assert.ok(store.eventFeed.some(e=>e.type==='ambient-conversation'),'event feed stores conversation');
console.log('ambientConversationSmoke passed');
