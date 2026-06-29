// B"H
import assert from 'node:assert/strict';
import { createTrainerRuntime, trainAbilityAtTrainer, trainerOffers, rankedPassage } from '../../ckidsAwtsmoos/systems/trainers/TrainerRuntime.js';

function makeOlam(){ const events=[]; return { events, player:{ level:8, perutah:100, maxKoach:100, koach:100, inventory:{ slots:[], actionSlots:[], equipment:{} } }, ayshPeula:(...args)=>events.push(args) }; }
const olam=makeOlam();
const offers=trainerOffers(olam);
assert.ok(offers.length>=4,'trainer offers exist');
const first=offers[0];
const trained=trainAbilityAtTrainer(olam, first.path, { slot:2, silent:true });
assert.equal(trained.ok,true,'training succeeds');
assert.equal(olam.player.perutah,100-first.cost,'training spends perutah');
assert.equal(olam.player.trainerState.abilityRanks[first.passageId],1,'rank stored');
assert.ok(olam.player.spellbook.learned[first.passageId],'spellbook learned passage');
assert.equal(olam.player.torahActionBar.slots[1].passageId,first.passageId,'trained passage assigned to requested slot');
const move={ id:first.passageId, damage:10, cost:5 };
assert.equal(rankedPassage(olam, move).rank,1,'ranked passage sees rank 1');
olam.player.level=1;
const gated=trainAbilityAtTrainer(olam, first.path, { silent:true });
assert.equal(gated.ok,false,'second rank gates by level when too low');
olam.player.level=8;
const second=trainAbilityAtTrainer(olam, first.path, { silent:true });
assert.equal(second.ok,true,'second rank trains after level restored');
assert.ok(rankedPassage(olam, move).damage>10,'rank increases passage damage');
const legacyStore={};
const legacy=createTrainerRuntime(legacyStore);
const legacyTrainer=legacy.train(first.path);
assert.ok(legacy.known().includes(legacyTrainer.passageId),'legacy store training remains compatible');
console.log('trainerRankedAbilitySmoke passed');
