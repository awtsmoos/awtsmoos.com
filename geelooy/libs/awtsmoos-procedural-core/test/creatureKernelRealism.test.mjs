// B"H
// Boruch Hashem
// Blessed is He
/** Creature realism evidence proves tissue and microdetail remain derived from stable Briah regions. */
import assert from "node:assert/strict";
import { compileGenomeToBriah, createAtzilusGenome } from "../src/core/animalMesh/creature/index.js";
import { compileCreatureMicrodetail } from "../src/core/animalMesh/creature/realism/compileCreatureMicrodetail.js";
import { createCreatureTissueProfile } from "../src/core/animalMesh/creature/realism/createCreatureTissueProfile.js";

const creature = compileGenomeToBriah(createAtzilusGenome({ seed: 73 }));
const tissue = createCreatureTissueProfile(creature, { muscleScale: 1.2, fatScale: 0.85 });
const secondTissue = createCreatureTissueProfile(creature, { muscleScale: 1.2, fatScale: 0.85 });
assert.deepEqual(tissue, secondTissue);
assert.equal(tissue.sourceBriahId, creature.id);
assert.equal(tissue.regions.length, creature.body.sections.length);
assert.ok(tissue.regions.every(region => region.tissue.dermisThickness > 0));
const detail = compileCreatureMicrodetail(creature, tissue, { coat: "fur", density: 1.4 });
assert.equal(detail.regions.length, tissue.regions.length);
assert.ok(detail.regions.every(region => region.mask.regionIds.length === 1));
assert.ok(detail.regions.every(region => region.animation.followsSkin));
assert.equal(detail.preservationPolicy, "regenerate-from-semantic-regions");
console.log('B"H | creatureKernelRealism.test passed');
