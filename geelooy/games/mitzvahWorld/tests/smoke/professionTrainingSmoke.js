// B"H
import assert from 'node:assert/strict';
import { trainProfession, recipeKnown } from '../../ckidsAwtsmoos/systems/professions/ProfessionTrainingRuntime.js';
import { craftItem, createProfessionRuntime } from '../../ckidsAwtsmoos/systems/professions/ProfessionRuntime.js';
const store={ economy:{ flour:1, charity:1, wax:1, plank:1, paper:1, ink:1 }, villageProjects:{} };
assert.equal(craftItem(store,'challah','player',{requireTraining:true}).ok,false,'untrained recipe blocked');
trainProfession(store,'baker');
assert.equal(recipeKnown(store,'challah'),true,'baker training unlocks challah');
assert.ok(craftItem(store,'challah','player',{requireTraining:true}).id,'trained craft succeeds');
assert.ok(createProfessionRuntime(store).outputs().includes('challah'),'runtime outputs trained recipes');
console.log('professionTrainingSmoke passed');
