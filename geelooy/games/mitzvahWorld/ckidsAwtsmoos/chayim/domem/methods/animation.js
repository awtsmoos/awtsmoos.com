// B"H
/** GLB animation runtime: tolerant clip matching and automatic Chossid motion startup. */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

const WORKER_MIXER_FLAG = "__AWTSMOOS_ENABLE_WORKER_PLAYER_MIXER__";
const DISABLE_PLAYER_MIXER_FLAG = "__AWTSMOOS_DISABLE_PLAYER_MIXER__";
const PERF_MIXER_FLAG = "__AWTSMOOS_ENABLE_PERF_MIXER__";
const ALIASES = Object.freeze({ idle:["stand", "neutral", "idle"], stand:["stand", "neutral"], run:["run"], walk:["walk"], jump:["jump"], falling:["falling", "fall"], "left turn":["walk", "stand"], "right turn":["walk", "stand"], talk:["hands", "stand"], teach:["hands", "stand"], punch:["punch"], stab:["stab"], "dance silly":["dance silly", "dance"] });
const now = () => typeof performance !== "undefined" ? performance.now() : Date.now();
const finite = (v, f) => Number.isFinite(Number(v)) ? Number(v) : f;
const norm = v => String(v || "").toLowerCase().replace(/armature|mixamo\.com|layer0|[|_.]/g, " ").replace(/\s+/g, " ").trim();
const worker = () => typeof document === "undefined";
function playerLike(e) { return Boolean(e?.type === "chossid" || e?.olam?.chossid === e || e?.olam?.player === e); }
function blend(e) { return Math.max(.035, Math.min(.18, finite(e?.animationBlendDuration, .075))); }
function perf(e) { return Boolean(globalThis.__AWTSMOOS_PERFORMANCE_MODE__ || e?.olam?.baseInfo?.compact || e?.olam?.baseInfo?.testWorldFlags?.compact); }
function mayAdvance(e) { if (!e?.animationMixer) return false; if (playerLike(e) && globalThis[DISABLE_PLAYER_MIXER_FLAG] === true) return false; if (worker() && playerLike(e)) return globalThis[WORKER_MIXER_FLAG] !== false; if (perf(e) && globalThis[PERF_MIXER_FLAG] === false) return false; return true; }
function stats(e, cost, advanced) { if (!playerLike(e)) return; const s = e.__awtsmoosPlayerAnimationStats || { frames:0, advanced:0, skipped:0, totalMs:0, maxMs:0 }; s.frames++; advanced ? s.advanced++ : s.skipped++; s.totalMs += cost; s.maxMs = Math.max(s.maxMs, cost); s.lastMs = Math.round(cost * 100) / 100; s.avgMs = Math.round(s.totalMs / Math.max(1, s.frames) * 100) / 100; s.currentClip = e.currentAction?._clip?.name || null; s.clipCount = e.animations?.length || 0; s.seal = "chossid-glb-animation-live-20260707-bh1"; e.__awtsmoosPlayerAnimationStats = s; if (e.olam) e.olam.__lastPlayerAnimationStats = s; }
function cache(e) { if (!e.__awtsmoosClipActionByKey) e.__awtsmoosClipActionByKey = new Map(); return e.__awtsmoosClipActionByKey; }
function candidates(name) { const key = norm(name); return [key, ...(ALIASES[key] || [])].map(norm).filter(Boolean); }
function score(clipName, wanted) { const cn = norm(clipName); let best = 0; for (const w of candidates(wanted)) { if (cn === w) best = Math.max(best, 100); if (cn.includes(w)) best = Math.max(best, 80); if (w.includes(cn)) best = Math.max(best, 50); } return best; }
function findClip(e, name) { const key = norm(name); if (!key || !e.animations?.length) return null; const c = cache(e); if (c.has(key)) return c.get(key); let best = null, points = -1; for (const clip of e.animations) { const s = score(clip.name, key); if (s > points) { best = clip; points = s; } } if (points <= 0) best = e.animations.find(a => /stand|neutral|idle/i.test(a.name)) || e.animations[0] || null; c.set(key, best); return best; }
function ensureStartup(e) { if (!e?.animationMixer || !e.animations?.length || e.currentAction) return; const want = e.isWalking ? "run" : "stand"; e.playChaweeyoos?.(want, { force:true, duration:.035 }); }
export default {
  heesHawvoos(deltaTime) {
    if (this.removed) return; Nivra.prototype.heesHawvoos.call(this, deltaTime); if (this.events?.heesHawvoos?.length) this.ayshPeula("heesHawvoos", this);
    ensureStartup(this); const started = now(), advance = mayAdvance(this) && Boolean(this.currentAction || this.currentAnimationPlaying);
    if (advance) this.animationMixer.update(Math.max(0, finite(deltaTime, 0))); stats(this, now() - started, advance);
  },
  clipActions:{}, nextAction:null, currentAction:null,
  resetChaweeyoos(shaym) { const clip = findClip(this, shaym); if (!clip || !this.animationMixer) return; const action = this.animationMixer.clipAction(clip); this.clipActions[shaym] ||= action; action.reset(); },
  playChayoos(shaym, op) { this.playChaweeyoos(shaym, op); },
  playChaweeyoos(shaym, options = {}) {
    if (!shaym || !this.animationMixer || !this.animations?.length) return; const clip = findClip(this, shaym); if (!clip) return;
    const action = this.animationMixer.clipAction(clip); if (this.currentAction === action && !options.force) return;
    const old = this.currentAction, loop = options.loop !== false; this.currentAction = action; action.reset(); action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce); action.clampWhenFinished = !loop; action.enabled = true; action.setEffectiveWeight(1); action.timeScale = finite(options.timeScale, finite(this.animationActionTimeScale, 1)); if (old) old.crossFadeTo(action, finite(options.duration, blend(this)), true); else action.fadeIn(finite(options.duration, blend(this))); action.play(); this.currentAnimationPlaying = true; this.__lastResolvedClipName = clip.name;
    if (!loop) { const done = event => { if (event.action !== action) return; this.animationMixer.removeEventListener("finished", done); options.done?.(); }; this.animationMixer.addEventListener("finished", done); }
  },
  getChaweeyoos() { this.chaweeyoos = (this.animations || []).map(q => q.name); return this.chaweeyoos; },
  simplePlayOnceAnimation(shaym) { this.playChaweeyoos(shaym, { loop:false, duration:blend(this) }); }
};
