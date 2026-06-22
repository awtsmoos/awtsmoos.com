// B"H
/** @file animalLodAndSingleMeshAudit.js @description ESM static proof that animals are single-mesh and animation LOD is wired. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }
const renderer = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionWildlifeRenderer.js");
const forge = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalBodyForge.js");
const factory = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/skinned/AnimalRenderableFactory.js");
const animator = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalAnimator.js");
const lod = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/wildlife/render/AnimalAnimationLod.js");
assert(renderer.includes("singleMeshAnimals") && renderer.includes("maxMeshesPerAnimal"), "wildlife renderer must expose single-mesh stats");
assert(!renderer.includes("invisibleTapProxy"), "wildlife renderer must not add invisible tap proxy meshes");
assert(forge.includes("singleMeshVerified") && forge.includes("renderMeshCount"), "animal forge must verify single mesh");
assert(factory.includes("singleMeshAnimal:true") && !factory.includes("addAttachments"), "renderable factory must be single mesh without attachments");
assert(animator.includes("AnimalAnimationLod") && animator.includes("animalAnimationSkipped"), "animator must use LOD and count skipped work");
assert(lod.includes("medium") && lod.includes("frozen") && lod.includes("shouldAnimateAnimal"), "animation LOD module must define levels");
console.log(JSON.stringify({ ok:true, test:"animalLodAndSingleMeshAudit" }, null, 2));
