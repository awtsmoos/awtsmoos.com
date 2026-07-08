// B"H
/** @file ThreeAnimationAdapter.js @description Abstract bone tracks become binding-safe Three animation clips only here. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function values(keys = []) { return new Float32Array(keys.flatMap(k => k.value || [0, 0, 0])); }
function times(keys = []) { return new Float32Array(keys.map(k => Number(k.time) || 0)); }
function quatValues(keys = []) { const out = []; for (const k of keys) { const r = k.value || [0, 0, 0]; const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0] || 0, r[1] || 0, r[2] || 0)); out.push(q.x, q.y, q.z, q.w); } return new Float32Array(out); }
function safeName(name = "root") { return String(name).replace(/[.\[\]:/]/g, "_"); }
function trackName(boneId, field) { return `${safeName(boneId)}.${field}`; }
function makeTrack(tr) { const keys = tr.keys || [], t = times(keys), field = tr.kind === "position" ? "position" : "quaternion"; if (tr.kind === "position") return new THREE.VectorKeyframeTrack(trackName(tr.boneId, field), t, values(keys)); return new THREE.QuaternionKeyframeTrack(trackName(tr.boneId, field), t, quatValues(keys)); }
export function createThreeClip(intent = {}) {
  const tracks = [];
  for (const tr of intent.tracks || []) if (tr && tr.boneId && tr.keys && tr.keys.length) tracks.push(makeTrack(tr));
  const clip = new THREE.AnimationClip(intent.name || "awtsmoos_clip", intent.duration || -1, tracks);
  clip.userData.awtsmoosClipIntent = intent;
  clip.userData.trackNames = tracks.map(t => t.name);
  clip.userData.bindingSafeTrackMode = "direct-bone-node-name";
  return clip;
}
export function createThreeMixer(root) { return new THREE.AnimationMixer(root); }
export default { createThreeClip, createThreeMixer };
