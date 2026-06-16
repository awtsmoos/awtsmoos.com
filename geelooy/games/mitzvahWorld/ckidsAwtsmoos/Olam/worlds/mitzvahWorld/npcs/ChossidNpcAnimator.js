// B"H
/** @file ChossidNpcAnimator.js @description NPCs reuse player clips and obey one shared parser-clear motionRole. */
import * as THREE from "/games/scripts/build/three.module.js";
const BAD = /dance|jump|fall|attack/i;
function clipName(item) { return item && item.name ? item.name : ""; }
function allowed(item) { return !BAD.test(clipName(item)); }
function clipFor(animations, role) {
  const rules = role === "walk" ? [/walk/i, /run/i, /move/i] : [/idle/i, /stand/i, /breath/i, /rest/i];
  for (const rule of rules) {
    const clip = animations.find(item => rule.test(clipName(item)) && allowed(item));
    if (clip) return clip;
  }
  return animations.find(allowed) || animations[0] || null;
}
function ensureData(bridge) { if (!bridge.userData) bridge.userData = {}; return bridge.userData; }
function roleOf(bridge) { const data = bridge.userData || {}; return bridge.motionRole || data.motionRole || (bridge.__isWalking ? "walk" : "idle"); }
function fadeFrom(action, next) { if (action && typeof action.crossFadeTo === "function") action.crossFadeTo(next, .12, true); }
function updateMixer(mixer, dt) { if (mixer && typeof mixer.update === "function") mixer.update(Math.min(.05, Math.max(.001, Number(dt) || 1 / 60))); }
function saveRole(bridge, nextRole) { bridge.motionRole = nextRole; const data = ensureData(bridge); data.motionRole = nextRole; }
export function attachChossidNpcAnimator(npc, animations = [], bridge = {}) {
  const clips = Array.isArray(animations) ? animations : [];
  const mixer = clips.length ? new THREE.AnimationMixer(npc) : null;
  let role = null, action = null;
  bridge.animations = clips; bridge.animationMixer = mixer;
  bridge.playNpcMotion = nextRole => {
    if (!mixer || role === nextRole) return;
    const clip = clipFor(clips, nextRole); if (!clip) return;
    const next = mixer.clipAction(clip); next.reset().setLoop(THREE.LoopRepeat).fadeIn(.12).play(); next.timeScale = nextRole === "walk" ? .9 : .65;
    fadeFrom(action, next); action = next; role = nextRole; saveRole(bridge, nextRole);
  };
  bridge.heesHawvoos = dt => { bridge.playNpcMotion(roleOf(bridge)); updateMixer(mixer, dt); };
  bridge.playNpcMotion("idle");
  if (!npc.userData) npc.userData = {};
  npc.userData.npcAnimationClips = clips.map(clip => clipName(clip)); npc.userData.npcAnimationMixer = Boolean(mixer);
  return bridge;
}
export default attachChossidNpcAnimator;
