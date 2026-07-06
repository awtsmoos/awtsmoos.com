// B"H
/**
 * @file ModelInspectionReporter.js
 * @description Chapter 502: the garment names its threads.
 * When the remote chossid finally descends, this witness counts meshes,
 * materials, morphs, bones, clips, cameras, and attachment-like sockets so no
 * architect needs to guess what the model contains.
 */
const GLOBAL_REPORTS = "__MITZVAH_WORLD_MODEL_REPORTS__";
const LIMIT = 240;
function arr(value) { return Array.isArray(value) ? value : value ? [value] : []; }
function num(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function safeName(value, fallback = "unnamed") { return String(value || fallback).slice(0, 120); }
function materialInfo(material) {
  return arr(material).map(item => ({ name:safeName(item?.name, "material"), type:safeName(item?.type, "Material"), transparent:Boolean(item?.transparent), map:Boolean(item?.map), skinning:Boolean(item?.skinning), morphTargets:Boolean(item?.morphTargets) }));
}
function morphNames(geometry) {
  const dict = geometry?.morphAttributes || {}, names = new Set(Object.keys(geometry?.morphTargetDictionary || {}));
  for (const key of Object.keys(dict)) for (const item of arr(dict[key])) names.add(item?.name || key);
  return [...names].filter(Boolean).slice(0, LIMIT);
}
function boneInfo(skeleton) {
  return arr(skeleton?.bones).map((bone, index) => ({ index, name:safeName(bone?.name, `bone_${index}`), parent:safeName(bone?.parent?.name, "") })).slice(0, LIMIT);
}
function attrCounts(geometry) {
  const attrs = geometry?.attributes || {};
  return Object.fromEntries(Object.keys(attrs).map(key => [key, num(attrs[key]?.count)]));
}
function attachmentLike(name) { return /hand|finger|weapon|hat|head|coat|shoe|shirt|pants|yarmulka|glasses|socket|attach/i.test(name || ""); }
function inspectNode(node, report) {
  const name = safeName(node?.name, node?.type || "Object3D");
  if (attachmentLike(name)) report.attachmentCandidates.push({ name, type:node?.type || "Object3D" });
  if (node?.isBone) report.bones.push({ name, parent:safeName(node.parent?.name, "") });
  if (!node?.isMesh && !node?.isSkinnedMesh) return;
  const geometry = node.geometry || {}, morphs = morphNames(geometry);
  const mesh = { name, type:node.isSkinnedMesh ? "SkinnedMesh" : "Mesh", vertices:num(geometry.attributes?.position?.count), attributes:attrCounts(geometry), materials:materialInfo(node.material), morphTargets:morphs };
  report.meshes.push(mesh);
  if (node.isSkinnedMesh) report.skinnedMeshes.push({ ...mesh, bones:boneInfo(node.skeleton) });
}
export function inspectGltf(gltf, url = "unknown") {
  const report = { seal:"model-inspection-20260706-bh1", url, at:Date.now(), hasScene:Boolean(gltf?.scene), sceneChildren:gltf?.scene?.children?.length || 0, meshes:[], skinnedMeshes:[], bones:[], materials:[], morphTargets:[], attachmentCandidates:[], clips:[], cameras:[] };
  gltf?.scene?.traverse?.(node => inspectNode(node, report));
  const materialMap = new Map();
  for (const mesh of report.meshes) for (const mat of mesh.materials) materialMap.set(`${mat.name}:${mat.type}`, mat);
  report.materials = [...materialMap.values()];
  report.morphTargets = [...new Set(report.meshes.flatMap(mesh => mesh.morphTargets))];
  report.clips = arr(gltf?.animations).map(clip => ({ name:safeName(clip?.name, "clip"), duration:num(clip?.duration), tracks:clip?.tracks?.length || 0 })).slice(0, LIMIT);
  report.cameras = arr(gltf?.cameras).map(camera => ({ name:safeName(camera?.name, "camera"), type:safeName(camera?.type, "Camera") }));
  report.summary = { meshes:report.meshes.length, skinnedMeshes:report.skinnedMeshes.length, bones:report.bones.length, materials:report.materials.length, morphTargets:report.morphTargets.length, clips:report.clips.length, cameras:report.cameras.length, attachmentCandidates:report.attachmentCandidates.length };
  try { gltf.userData ||= {}; gltf.userData.awtsmoosModelInspection = report; } catch {}
  try { globalThis[GLOBAL_REPORTS] ||= []; globalThis[GLOBAL_REPORTS].push(report); globalThis[GLOBAL_REPORTS] = globalThis[GLOBAL_REPORTS].slice(-24); } catch {}
  return report;
}
export function latestModelReports() { return [...(globalThis[GLOBAL_REPORTS] || [])]; }
export default inspectGltf;
