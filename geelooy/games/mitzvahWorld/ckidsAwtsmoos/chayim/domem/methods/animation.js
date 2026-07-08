// B"H
/**
 * @file animation.js
 * @description Direct GLB AnimationMixer clip playback with old-method crossfades.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=stable-collision-animation-20260708-bh4';
import Nivra from "../../nivra.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const ALIASES = Object.freeze({
  idle:["idle", "stand", "breath"],
  walk:["walk", "walking"],
  run:["run", "running"],
  jump:["jump", "jumping"],
  falling:["falling", "fall", "air", "drop"],
  "left turn":["left turn", "turn left", "left"],
  "right turn":["right turn", "turn right", "right"]
});

function finite(value, fallback) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function blend(entity, value) {
  return Math.max(0.06, Math.min(0.36, finite(value, finite(entity?.animationBlendDuration, 0.18))));
}

function clipRate(name, options, entity) {
  if (Number.isFinite(Number(options?.timeScale))) return Number(options.timeScale);
  const lower = String(name || "").toLowerCase();
  if (lower.includes("run")) return 1;
  if (lower.includes("walk")) return 1;
  if (lower.includes("jump")) return 1;
  if (lower.includes("fall")) return 1;
  return finite(entity?.animationActionTimeScale, 1);
}

function clipList(entity) {
  return Array.isArray(entity?.animations) ? entity.animations : [];
}

function findClip(entity, requested) {
  const clips = clipList(entity);
  const want = String(requested || "").toLowerCase();
  if (!want) return null;
  const words = ALIASES[want] || [want];
  return clips.find(c => c.name.toLowerCase() === want)
    || clips.find(c => words.some(w => c.name.toLowerCase() === w))
    || clips.find(c => words.some(w => c.name.toLowerCase().includes(w)))
    || (want !== "idle" ? findClip(entity, "idle") : null);
}

function applyPostMixer(entity) {
  entity.applyProceduralPosture?.();
  const head = entity.boneChildren?.Head;
  const rot = entity.proceduralHeadRot;
  if (head && rot) {
    head.rotation.y += finite(rot.y, 0);
    head.rotation.x += finite(rot.x, 0);
  }
}

export default {
  heesHawvoos(deltaTime) {
    if (this.removed) return;
    Nivra.prototype.heesHawvoos.call(this, deltaTime);
    this.ayshPeula("heesHawvoos", this);
    if (this.currentAnimationPlaying && this.animationMixer) {
      this.animationMixer.update(Math.min(0.08, finite(deltaTime, 0)));
      applyPostMixer(this);
    }
  },

  clipActions:{},
  nextAction:null,
  currentAction:null,

  resetChaweeyoos(shaym) {
    const clip = findClip(this, shaym);
    if (!clip || !this.animationMixer) return;
    const action = this.animationMixer.clipAction(clip);
    this.clipActions[clip.name] = action;
    action?.reset();
  },

  playChayoos(shaym, options) {
    this.playChaweeyoos(shaym, options);
  },

  playChaweeyoos(shaym, options = {}) {
    if (!this.animationMixer || !clipList(this).length) return;
    const clip = findClip(this, shaym);
    if (!clip) return;
    const action = this.animationMixer.clipAction(clip);
    const same = this.currentAction === action;
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.timeScale = clipRate(clip.name, options, this);
    if (same && !options.force) return;
    const old = this.currentAction;
    this.currentAction = action;
    const loop = options.loop !== false;
    action.reset();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    action.clampWhenFinished = !loop;
    if (old && old !== action) old.crossFadeTo(action, blend(this, options.duration), true);
    else action.fadeIn(blend(this, options.duration));
    action.play();
    this.currentAnimationPlaying = true;
    this.__lastAnimationAction = { at:Date.now(), clip:clip.name, requested:shaym, timeScale:action.timeScale, loop };
    if (!loop) {
      const done = event => {
        if (event.action !== action) return;
        this.animationMixer.removeEventListener("finished", done);
        options.done?.();
      };
      this.animationMixer.addEventListener("finished", done);
    }
  },

  getChaweeyoos(shaym) {
    this.chaweeyoos = clipList(this).map(clip => clip.name);
    if (shaym) return findClip(this, shaym)?.name || null;
    return this.chaweeyoos;
  },

  simplePlayOnceAnimation(shaym) {
    this.playChaweeyoos(shaym, { loop:false, duration:blend(this) });
  }
};
