// B"H
/** @file AnimalRenderableAudit.js @description Binding, skeleton, skin, and surface proof for procedural animals. */
function dataOf(object) { return object && object.userData ? object.userData : {}; }
function boneIds(root) { const pack = dataOf(root).skeletonPack || {}; return new Set(Object.keys(pack.boneMap || {})); }
function actionTrackNames(root) { const controller = dataOf(root).animalAnimationController, actions = controller ? controller.actions || {} : {}; return Object.values(actions).flatMap(action => { const clip = action && action._clip ? action._clip : null; return clip && clip.tracks ? clip.tracks.map(t => t.name) : []; }); }
function missingTrackBones(root) { const ids = boneIds(root), out = []; for (const name of actionTrackNames(root)) { const bone = String(name).split('.')[0]; if (bone && !ids.has(bone)) out.push(bone); } return [...new Set(out)]; }
export function auditAnimalRenderable(root) {
  const out = { roots:0, skinnedMeshes:0, bones:0, clips:0, missingSkinAttributes:0, backend:null, hasSkeleton:false, isSkinnedMesh:false, mixerTarget:"none", bindingUnsafe:false, missingTrackBones:[], closedSurface:false, vertexCount:0, triangleCount:0 };
  if (!root) return out; const rootData = dataOf(root); out.roots = rootData.proceduralSkinnedAnimal ? 1 : 0; out.backend = rootData.renderBackend || null; out.clips = rootData.clipCount || 0; out.mixerTarget = rootData.animationMixerTarget || "none"; out.closedSurface = Boolean(rootData.surfaceMetadata && rootData.surfaceMetadata.closedSurface); out.vertexCount = rootData.surfaceMetadata ? rootData.surfaceMetadata.vertexCount || 0 : 0; out.triangleCount = rootData.surfaceMetadata ? rootData.surfaceMetadata.triangleCount || 0 : 0;
  if (typeof root.traverse === "function") root.traverse(child => { const data = dataOf(child); if (data.awtsmoosSkinnedMesh) { out.skinnedMeshes++; out.bones += data.boneCount || 0; out.isSkinnedMesh = out.isSkinnedMesh || Boolean(child.isSkinnedMesh); out.hasSkeleton = out.hasSkeleton || Boolean(child.skeleton && child.skeleton.bones && child.skeleton.bones.length); if (!data.skinAttributeProof) out.missingSkinAttributes++; } });
  out.missingTrackBones = missingTrackBones(root); out.bindingUnsafe = !out.isSkinnedMesh || !out.hasSkeleton || out.mixerTarget !== "skinnedMesh" || out.missingTrackBones.length > 0; return out;
}
export function assertAnimalRenderable(root) { const a = auditAnimalRenderable(root); if (!a.roots || !a.skinnedMeshes || a.bones < 12 || a.missingSkinAttributes || a.bindingUnsafe) throw new Error(`B\"H animal renderable audit failed ${JSON.stringify(a)}`); return a; }
export default auditAnimalRenderable;
