// B"H
import assert from "node:assert/strict";
import { weaponStats } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/WeaponStatCatalog.js";
import { createHeldMeshDescriptor } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/HeldMeshDescriptorFactory.js";
import { buildThreeHeldMesh, heldMeshMaterialReport } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/render/ThreeHeldMeshBuilder.js";
import { weaponMaterialReport } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/WeaponMaterialResolver.js";
function report(id){ const descriptor=createHeldMeshDescriptor(weaponStats(id)); const mesh=buildThreeHeldMesh(descriptor); return {descriptor, mesh, material:weaponMaterialReport(descriptor), meshReport:heldMeshMaterialReport(mesh)}; }
const simple=report("simpleSword");
assert.ok(simple.descriptor.materialGroups.includes("blade"));
assert.ok(simple.descriptor.materialGroups.includes("guard"));
assert.ok(simple.descriptor.materialGroups.includes("grip"));
assert.ok(simple.material.materials.some(m=>m.group==="blade"&&m.metalness>.8));
assert.ok(simple.material.materials.some(m=>m.group==="grip"&&m.textureHint.includes("leather")));
assert.ok(simple.mesh.children.some(c=>c.material.name==="silver-blade"));
assert.ok(simple.mesh.children.some(c=>c.material.name==="leather-grip"));
const great=report("mitzvahGreatSword");
assert.ok(great.material.materials.some(m=>m.material==="mitzvah-steel"&&m.emissive));
assert.ok(great.material.materials.some(m=>m.group==="engraving"));
const staff=report("nerMitzvahStaff");
assert.ok(staff.descriptor.materialGroups.includes("wood"));
assert.ok(staff.descriptor.materialGroups.includes("flame"));
assert.ok(staff.material.materials.some(m=>m.textureHint==="oil-blessed-wood"));
assert.ok(staff.material.materials.some(m=>m.textureHint==="living-flame"&&m.emissive));
const bow=report("hebrewBow");
assert.ok(bow.descriptor.materialGroups.includes("wood"));
assert.ok(bow.descriptor.materialGroups.includes("string"));
assert.ok(bow.descriptor.materialGroups.includes("letter"));
assert.ok(bow.material.materials.some(m=>m.textureHint==="letter-carved-cedar"));
assert.ok(bow.material.materials.some(m=>m.textureHint==="light-string"));
assert.ok(bow.material.materials.some(m=>m.textureHint==="glowing-hebrew-letter"));
for (const r of [simple,great,staff,bow]) {
  assert.equal(r.mesh.children.length, r.descriptor.recipe.parts.length);
  assert.ok(r.meshReport.materials.every(m=>m.textureHint));
}
console.log("B'H mitzvahWorld.weaponMaterials.smoke passed", { simple:simple.descriptor.materialGroups, staff:staff.descriptor.materialGroups, bow:bow.descriptor.materialGroups });
