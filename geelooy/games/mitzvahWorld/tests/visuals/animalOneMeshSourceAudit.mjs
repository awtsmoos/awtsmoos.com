// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const stable = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionStableAnimalShape.js", "utf8");
const forge = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AwtsmoosProceduralAnimalMesh.js", "utf8");
assert(stable.includes("createAwtsmoosProceduralAnimalMesh"));
assert(stable.includes("multiPartAnimalMesh:false"));
assert(stable.includes("singleMergedAnimalMesh:true"));
assert(forge.includes("new THREE.Mesh(geometry, material)"));
assert(forge.includes("renderMeshCount:1"));
assert(!forge.includes("new THREE.Group"));
console.log(JSON.stringify({ ok:true, audit:"animalOneMeshSourceAudit" }, null, 2));
