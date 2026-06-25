// B"H
import assert from 'node:assert/strict';
import { questChainStatus, advanceQuestChain } from '../../ckidsAwtsmoos/systems/missions/QuestChainRuntime.js';
const store={ eventFeed:[] };
let status=questChainStatus(store,'bakery_kindness');
assert.equal(status.activeNode,'bring_flour','first chain node opens');
status=advanceQuestChain(store,'bakery_kindness');
assert.equal(status.activeNode,'bake_challah','second node opens after first');
status=advanceQuestChain(store,'bakery_kindness');
assert.equal(status.activeNode,'feed_guest','third node opens after second');
assert.ok(store.eventFeed.some(e=>e.type==='quest-chain-advance'),'chain event recorded');
console.log('questChainRuntimeSmoke passed');
