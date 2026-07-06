// B"H
import assert from "node:assert/strict";
import { installTrainerFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/trainers/runtime/TrainerFeaturePack.js";
import { installEconomyFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/economy/runtime/EconomyFeaturePack.js";
import { installEquippedWeaponFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/EquippedWeaponFeaturePack.js";

const runtime={entities:new Map(),ready:[],registerEntity(e){this.entities.set(e.id,e);return e;},markReady(k,v){this.ready.push([k,v]);}};
const trainers=installTrainerFeaturePack(runtime);
const economy=installEconomyFeaturePack(runtime,{startingPerutas:5000});
const equipment=installEquippedWeaponFeaturePack(runtime);

let lockedBuy=economy.buy("player","bowyer","hebrewBow");
assert.equal(lockedBuy.ok,false);
assert.equal(lockedBuy.reason,"trainer-required");
assert.equal(equipment.equip("player","hebrewBow",null).reason,"trainer-required");
let ui=economy.shop({actorId:"player",merchantId:"bowyer",selectedId:"hebrewBow",runtime});
assert.equal(ui.actions.trainerRequired,true);
trainers.train("player","bow",2,{perutas:100,practice:"range"});
trainers.train("player","scribe",1,{book:"letters"});
let bought=economy.buy("player","bowyer","hebrewBow");
assert.equal(bought.ok,true);
assert.equal(equipment.equip("player","hebrewBow",null).ok,true);
economy.damageItem("player","hebrewBow",.4);
ui=economy.shop({actorId:"player",merchantId:"bowyer",selectedId:"hebrewBow",runtime,equippedId:"cedarBow"});
assert.equal(ui.actions.canRepair,true);
assert.ok(ui.preview.statDiff.range>0);
const repaired=economy.repair("player","bowyer","hebrewBow");
assert.equal(repaired.ok,true);
assert.equal(repaired.condition,1);
trainers.train("player","sword",2,{});
const simple=economy.buy("player","blacksmith","simpleSword");
assert.equal(simple.ok,true);
const upgraded=economy.upgrade("player","blacksmith","simpleSword");
assert.equal(upgraded.ok,true);
assert.equal(upgraded.nextId,"longPracticeSword");
assert.ok(economy.snapshot("player").inventory.inventory.includes("longPracticeSword"));
console.log("B'H mitzvahWorld.trainerShopRepair.smoke passed", { ready:runtime.ready.length, entities:runtime.entities.size });
