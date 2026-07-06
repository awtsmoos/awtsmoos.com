// B"H
import { CHOSSID_GLB_INSPECTION } from "./MitzvahPlatformCatalog.js";

const mouthNames = new Set(CHOSSID_GLB_INSPECTION.morphTargets.mouth);

function listMaterials(material) {
  return Array.isArray(material) ? material : material ? [material] : [];
}

export function inspectChossidModel(root) {
  const report = {
    source:CHOSSID_GLB_INSPECTION.url,
    meshes:[],
    bones:[],
    materials:new Set(),
    morphTargets:[],
    wardrobe:{ hats:[], coats:[], shirts:[], pants:[], shoes:[], accessories:[] },
    facial:{ mouthMeshes:[], blinkMeshes:[], eyebrowMeshes:[], headBone:null }
  };
  root?.traverse?.(child => {
    const name = child?.name || "";
    if (child?.isBone) {
      report.bones.push(name);
      if (name === CHOSSID_GLB_INSPECTION.skeleton.head) report.facial.headBone = name;
    }
    if (child?.isMesh || child?.isSkinnedMesh) {
      report.meshes.push(name);
      for (const material of listMaterials(child.material)) if (material?.name) report.materials.add(material.name);
      const dict = child.morphTargetDictionary || {};
      const names = Object.keys(dict);
      for (const morphName of names) {
        report.morphTargets.push({ mesh:name, name:morphName, index:dict[morphName] });
        if (mouthNames.has(morphName)) report.facial.mouthMeshes.push(name);
      }
      if (/top-hat|tophat|yamulka|yarmalka|yarmulke/i.test(name)) report.wardrobe.hats.push(name);
      if (/jacket|coat/i.test(name)) report.wardrobe.coats.push(name);
      if (/shirt/i.test(name)) report.wardrobe.shirts.push(name);
      if (/pant|trouser|body/i.test(name)) report.wardrobe.pants.push(name);
      if (/shoe|boot/i.test(`${name} ${listMaterials(child.material).map(m => m?.name).join(" ")}`)) report.wardrobe.shoes.push(name);
      if (/teffilin|glasses|tzitis|ritzooyoys/i.test(name)) report.wardrobe.accessories.push(name);
      if (/eyelid/i.test(name)) report.facial.blinkMeshes.push(name);
      if (/brow/i.test(name)) report.facial.eyebrowMeshes.push(name);
    }
  });
  return {
    ...report,
    materials:[...report.materials],
    counts:{ meshes:report.meshes.length, bones:report.bones.length, materials:report.materials.size, morphTargets:report.morphTargets.length },
    matchesGlbInspection:report.bones.includes(CHOSSID_GLB_INSPECTION.skeleton.head) && report.morphTargets.some(m => mouthNames.has(m.name))
  };
}

export function collectSpeechMorphTargets(root) {
  const targets = [];
  root?.traverse?.(child => {
    const dict = child?.morphTargetDictionary;
    const influences = child?.morphTargetInfluences;
    if (!dict || !influences) return;
    for (const name of Object.keys(dict)) {
      if (mouthNames.has(name)) targets.push({ mesh:child, name, index:dict[name] });
    }
  });
  return targets;
}

export function applySpeechMorphFrame(root, options = {}) {
  const targets = collectSpeechMorphTargets(root);
  const t = Number(options.time ?? (Date.now() / 1000));
  const energy = Math.max(0, Math.min(1, Number(options.energy ?? .75)));
  const open = Math.max(0, Math.sin(t * 18) * .5 + .5) * energy;
  for (const target of targets) {
    target.mesh.morphTargetInfluences[target.index] = target.name === "O" ? open : Math.max(0, 1 - open) * .25 * energy;
  }
  return { ok:targets.length > 0, targets:targets.map(t => ({ mesh:t.mesh.name, name:t.name, index:t.index })), open:Number(open.toFixed(3)) };
}

export default { inspectChossidModel, collectSpeechMorphTargets, applySpeechMorphFrame };
