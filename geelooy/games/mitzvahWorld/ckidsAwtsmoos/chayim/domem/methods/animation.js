// B"H
/** Raw GLB AnimationMixer playback, matching the passing chossid example. */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=real-raw-chossid-animation-20260708-bh1';
import Nivra from "../../nivra.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const ALIASES = Object.freeze({
  idle:["idle", "stand", "neutral", "breath"],
  walk:["walk", "walking"],
  run:["run", "running"],
  jump:["jump", "jumping"],
  falling:["falling", "fall", "air", "drop"],
  "left turn":["left turn", "turn left"],
  "right turn":["right turn", "turn right"]
});
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clipsOf = entity => Array.isArray(entity?.animations) ? entity.animations : [];
const blend = (entity, value) => Math.max(0.04, Math.min(0.18, finite(value, finite(entity?.animationBlendDuration, 0.08))));

function norm(value) { return String(value || "").toLowerCase().trim(); }
function clipRate(name, options, entity) {
  if (Number.isFinite(Number(options?.timeScale))) return Number(options.timeScale);
  return finite(entity?.animationActionTimeScale, 1);
}
function findClip(entity, requested) {
  const clips = clipsOf(entity), want = norm(requested);
  if (!clips.length) return null;
  if (!want) return clips[0];
  const aliases = ALIASES[want] || [want];
  return clips.find(c => norm(c.name) === want)
    || clips.find(c => aliases.some(a => norm(c.name) === a))
    || clips.find(c => aliases.some(a => norm(c.name).includes(a)))
    || (want !== "idle" ? findClip(entity, "idle") : clips[0]);
}
function remember(entity, clip, request, action, loop) {
  entity.__lastAnimationAction = { at:Date.now(), clip:clip.name, requested:request, timeScale:action.timeScale, loop, rawMixer:true };
  entity.modelMesh?.userData && (entity.modelMesh.userData.rawChossidAnimation = entity.__lastAnimationAction);
  globalThis.__AWTS_CHOSSID_REAL_ANIMATION_PROOF__ = entity.__lastAnimationAction;
}
function stopOld(oldAction, nextAction, entity, duration) {
  if (!oldAction || oldAction === nextAction) return;
  oldAction.enabled = true;
  oldAction.crossFadeTo(nextAction, blend(entity, duration), false);
}

export default {
  clipActions:{},
  nextAction:null,
  currentAction:null,

  heesHawvoos(deltaTime) {
    if (this.removed) return;
    Nivra.prototype.heesHawvoos.call(this, deltaTime);
    this.ayshPeula("heesHawvoos", this);
    if (!this.currentAnimationPlaying || !this.animationMixer) return;
    this.animationMixer.update(Math.min(0.05, Math.max(0, finite(deltaTime, 0))));
  },

  resetChaweeyoos(shaym) {
    const clip = findClip(this, shaym);
    if (!clip || !this.animationMixer) return;
    const action = this.animationMixer.clipAction(clip);
    this.clipActions[clip.name] = action;
    action.reset();
  },

  playChayoos(shaym, options) { this.playChaweeyoos(shaym, options); },

  playChaweeyoos(shaym, options = {}) {
    if (!this.animationMixer || !clipsOf(this).length) return;
    const clip = findClip(this, shaym);
    if (!clip) return;
    const action = this.animationMixer.clipAction(clip);
    const same = this.currentAction === action;
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(clipRate(clip.name, options, this));
    if (same && !options.force) return;
    const old = this.currentAction;
    const loop = options.loop !== false;
    this.currentAction = action;
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = !loop;
    action.fadeIn(blend(this, options.duration));
    action.play();
    stopOld(old, action, this, options.duration);
    this.currentAnimationPlaying = true;
    remember(this, clip, shaym, action, loop);
    if (!loop) this.animationMixer.addEventListener("finished", event => event.action === action && options.done?.());
  },

  getChaweeyoos(shaym) {
    this.chaweeyoos = clipsOf(this).map(clip => clip.name);
    return shaym ? findClip(this, shaym)?.name || null : this.chaweeyoos;
  },

  simplePlayOnceAnimation(shaym) { this.playChaweeyoos(shaym, { loop:false, duration:blend(this) }); }
};
