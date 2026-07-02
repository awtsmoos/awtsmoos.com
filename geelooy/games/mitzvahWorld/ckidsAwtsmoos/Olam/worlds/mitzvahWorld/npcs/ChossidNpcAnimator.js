// B"H
/**
 * @file ChossidNpcAnimator.js
 * @description Chapter 44: the NPC stops burning frames to pretend at life. Its
 * route is pre-known, its animation breathes rarely, and the player receives the speed.
 */
import * as THREE from "/games/scripts/build/three.module.js";
const BAD = /dance|jump|fall|attack/i, MIXER_STEP = .33, FAR_STEP = 1.25, NEAR_SQ = 18 * 18;
function clipName(item) { return item?.name || ""; }
function allowed(item) { return !BAD.test(clipName(item)); }
function clipFor(animations, role) {
  const rules = role === "walk" ? [/walk/i, /run/i, /move/i] : [/idle/i, /stand/i, /breath/i, /rest/i];
  for (const rule of rules) { const clip = animations.find(item => rule.test(clipName(item)) && allowed(item)); if (clip) return clip; }
  return animations.find(allowed) || animations[0] || null;
}
function ensureData(bridge) { bridge.userData ||= {}; return bridge.userData; }
function roleOf(bridge) { return bridge.motionRole || bridge.userData?.motionRole || (bridge.__isWalking ? "walk" : "idle"); }
function playerNear(bridge) {
  const a = bridge.mesh?.position, b = (bridge.olam?.chossid || bridge.olam?.player)?.mesh?.position;
  if (!a || !b) return false; const dx = a.x - b.x, dz = a.z - b.z; return dx * dx + dz * dz < NEAR_SQ;
}
function saveRole(bridge, nextRole) { bridge.motionRole = nextRole; ensureData(bridge).motionRole = nextRole; }
function updateMixer(mixer, dt) { if (mixer?.update) mixer.update(Math.min(.05, Math.max(.001, Number(dt) || 1 / 60))); }
function installRoute(bridge) {
  const p = bridge.mesh?.position || { x:0, z:0 }, x = Number(p.x)||0, z = Number(p.z)||0;
  bridge.precomputedRoute ||= [{ x, z }, { x:x + .001, z }];
  bridge.routeCursor ||= 0; bridge.__npcLowCost = true; bridge.__awtsmoosSimplePrecomputedNpc = true;
}
export function attachChossidNpcAnimator(npc, animations = [], bridge = {}) {
  const clips = Array.isArray(animations) ? animations : [], mixer = clips.length ? new THREE.AnimationMixer(npc) : null;
  let role = null, action = null, acc = 0;
  bridge.mesh = bridge.mesh || npc; bridge.animations = clips; bridge.animationMixer = mixer; installRoute(bridge);
  bridge.playNpcMotion = nextRole => { if (!mixer || role === nextRole) return; const clip = clipFor(clips, nextRole); if (!clip) return; const next = mixer.clipAction(clip); next.reset().setLoop(THREE.LoopRepeat).fadeIn(.08).play(); next.timeScale = nextRole === "walk" ? .75 : .45; action?.crossFadeTo?.(next, .08, true); action = next; role = nextRole; saveRole(bridge, nextRole); };
  bridge.heesHawvoos = dt => { acc += Math.min(.1, Number(dt) || 1 / 60); const step = playerNear(bridge) ? MIXER_STEP : FAR_STEP; if (acc < step && !bridge.__forceNpcAnimationTick) return; const delta = acc; acc = 0; bridge.playNpcMotion(roleOf(bridge)); updateMixer(mixer, delta); };
  bridge.playNpcMotion("idle"); npc.userData ||= {}; npc.userData.npcAnimationClips = clips.map(clipName); npc.userData.npcAnimationMixer = Boolean(mixer); npc.userData.lowCostNpc = true; return bridge;
}
export default attachChossidNpcAnimator;
