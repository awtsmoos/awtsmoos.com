// B"H
import assert from "node:assert/strict";
import { installProgressionFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/progression/runtime/ProgressionFeaturePack.js";
import { xpReward, statGrowth, xpForLevel } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/progression/runtime/LevelCurveRuntime.js";
import { moveStats } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/progression/runtime/MoveStatCatalog.js";
import { dangerForDistance } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/world/runtime/DistanceDangerRuntime.js";
import { installAnimals } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/animals/runtime/AnimalRuntimeFactory.js";
import { installKlipah, createKlipahEntity } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/combat/runtime/KlipahRuntimeFactory.js";
import { klipahTypes } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/combat/runtime/KlipahCreatureCatalog.js";
import { purifyDefeated } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/combat/runtime/PurificationRuntime.js";
const runtime={entities:new Map(),ready:[],registerEntity(e){this.entities.set(e.id,e);return e;},markReady(k,v){this.ready.push([k,v]);}};
const progression=installProgressionFeaturePack(runtime);
progression.ensure("player",{xp:xpForLevel(5),level:5});
assert.ok(xpReward({victorLevel:5,targetLevel:5})>xpReward({victorLevel:5,targetLevel:1}));
assert.ok(statGrowth(6).maxHealth>statGrowth(5).maxHealth);
assert.ok(dangerForDistance(500).level>dangerForDistance(20).level);
assert.ok(dangerForDistance(500).risk>dangerForDistance(20).risk);
const animals=installAnimals(runtime,[{id:"nearSheep",species:"sheep",position:{x:10,z:0}},{id:"farGoat",species:"goat",position:{x:520,z:0}}]);
assert.ok(animals[1].level>animals[0].level);
for(const animal of animals){ assert.ok(animal.stats.maxHealth>0); assert.ok(animal.moves.length>0); for(const move of animal.moves){ assert.ok(move.damage>=0); assert.ok(move.cooldown>=move.active); assert.ok(move.xpWeight>0); } }
assert.ok(klipahTypes().includes("noiseSwarm"));
const nearKlipah=createKlipahEntity({type:"darkMist",position:{x:10,z:0}});
const farKlipah=createKlipahEntity({type:"ashWolf",position:{x:680,z:0}});
assert.ok(farKlipah.level>nearKlipah.level);
assert.ok(farKlipah.corruptionAura.strength>nearKlipah.corruptionAura.strength);
for(const monster of [nearKlipah,farKlipah]){ assert.ok(monster.stats.attack>0); assert.ok(monster.moves.length>0); for(const move of monster.moves){ assert.ok(move.range>=0); assert.ok(move.startup>=0); assert.ok(move.cooldown>=move.active); } }
installKlipah(runtime,[nearKlipah,farKlipah]);
const before=progression.snapshot("player").level;
for(let i=0;i<6;i++) purifyDefeated(runtime,{actorId:"player",target:farKlipah,regionId:"far_region"});
const after=progression.snapshot("player");
assert.ok(after.level>=before);
assert.ok(after.xp>xpForLevel(5));
assert.equal(runtime.entities.get("far_region").shops,"reopened");
console.log("B'H mitzvahWorld.levelMovesXpRisk.smoke passed", { playerLevel:after.level, nearAnimal:animals[0].level, farAnimal:animals[1].level, farRisk:farKlipah.danger.risk });
