// B"H
import assert from "node:assert/strict";
import { CHOSSID_GLB_PATH } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/ChossidGlbPath.js";
import { loadNeutralGltf } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/Olam/graphics/procedural/NeutralGltfLoader.js";
import { installEquippedWeaponFeaturePack } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/EquippedWeaponFeaturePack.js";
import { weaponStats } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/WeaponStatCatalog.js";
import { createHeldMeshDescriptor } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/HeldMeshDescriptorFactory.js";
import { buildThreeHeldMesh } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/render/ThreeHeldMeshBuilder.js";
import { verifyChossidHands, makeMockActorRootFromNames, verifyAttachmentRoots, chossidBoneNamesFromDescriptor } from "../geelooy/games/mitzvahWorld/ckidsAwtsmoos/equipment/runtime/ChossidWeaponAttachmentVerifier.js";
const runtime={entities:new Map(),ready:[],registerEntity(e){this.entities.set(e.id,e);return e;},markReady(k,v){this.ready.push([k,v]);}};
const descriptor=await loadNeutralGltf(CHOSSID_GLB_PATH, fetch);
const hands=verifyChossidHands(descriptor);
assert.equal(hands.ok,true);
const actorRoot=makeMockActorRootFromNames(chossidBoneNamesFromDescriptor(descriptor));
assert.equal(verifyAttachmentRoots(actorRoot).right.name,"mixamorig:RightHand");
assert.equal(verifyAttachmentRoots(actorRoot).left.name,"mixamorig:LeftHand");
const equipment=installEquippedWeaponFeaturePack(runtime);
for(const id of ["simpleSword","willowShortSword","mitzvahGreatSword","nerMitzvahStaff","hebrewBow"]){ const item=weaponStats(id); const mesh=buildThreeHeldMesh(createHeldMeshDescriptor(item)); assert.ok(mesh.children.length>=3, `${id} mesh parts`); const equipped=equipment.equip("player",id,actorRoot,mesh); const att=equipped.attachment; assert.equal(equipped.ok,true, `${id} equip`); assert.equal(att.anchorName,"mixamorig:RightHand", `${id} right hand`); assert.equal(mesh.parent.name,"mixamorig:RightHand", `${id} parent`); if(item.handedness==="two"){ assert.equal(att.twoHand.needed,true, `${id} two hand needed`); assert.equal(att.twoHand.leftHandName,"mixamorig:LeftHand", `${id} left anchor`); assert.equal(item.leftHandAttachment,"mixamorig:LeftHand", `${id} stat left attachment`); } else { assert.equal(att.twoHand.needed,false, `${id} no left anchor`); } }
assert.ok(weaponStats("mitzvahGreatSword").damage>weaponStats("simpleSword").damage);
assert.ok(weaponStats("mitzvahGreatSword").weight>weaponStats("simpleSword").weight);
assert.ok(weaponStats("willowShortSword").weight<weaponStats("cedarGreatSword").weight);
assert.ok(equipment.snapshot().attachments.twoHand.count>=3);
console.log("B'H mitzvahWorld.chossidWeaponMeshes.smoke passed", {url:hands.url,nodes:hands.count,attachments:equipment.snapshot().attachments.count,twoHand:equipment.snapshot().attachments.twoHand.count});
