// B"H
import assert from "node:assert/strict";
import { installAnimals } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/animals/runtime/AnimalRuntimeFactory.js";
import { bestFoodFor, edibleFoods } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/animals/runtime/AnimalFoodCatalog.js";
const runtime={entities:new Map(),ready:[],registerEntity(e){this.entities.set(e.id,e);return e;},markReady(k,v){this.ready.push([k,v]);}};
const animals=installAnimals(runtime,[{id:"sheep1",species:"sheep",hunger:.9,thirst:.5},{id:"duck1",species:"duck",hunger:.9,thirst:.8}],{foods:["grass","hay","pondPlant","cleanWater"]});
assert.equal(animals.length,2);
assert.equal(bestFoodFor("duck",["grass","pondPlant"]).id,"pondPlant");
assert.ok(edibleFoods("sheep").some(f=>f.id==="grass"));
const before=animals[0].needs.hunger;
const ticked=runtime.animals.tick(1,{foods:["hay","cleanWater"]});
assert.equal(ticked[0].behavior.state,"eat");
assert.ok(ticked[0].needs.hunger<before);
assert.ok(ticked[0].lastFeeding.animation.includes("open-mouth"));
assert.equal(ticked[0].lastFeeding.swallowed,true);
assert.ok(ticked[0].physiology.mass>=animals[0].physiology.mass);
assert.equal(runtime.animals.snapshot().feeding.count,2);
console.log("B'H mitzvahWorld.animalFeeding.smoke passed", runtime.animals.snapshot());
