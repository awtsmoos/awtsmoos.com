// B"H
import assert from 'node:assert/strict';
import { applyHashgacha, chooseHashgachaEvent } from '../../ckidsAwtsmoos/systems/hashgacha/HashgachaRuntime.js';
const store={ economy:{ bread:0, flour:0 }, reputation:{ village:0 }, eventFeed:[] };
assert.equal(chooseHashgachaEvent(store,'smoke').type,'traveler_brings_flour','shortage chooses flour event');
const event=applyHashgacha(store,'smoke');
assert.equal(event.type,'traveler_brings_flour');
assert.equal(store.economy.flour,1,'hashgacha gift mutates economy');
assert.ok(store.eventFeed.length>0,'event feed records hashgacha');
console.log('hashgachaRuntimeSmoke passed');
