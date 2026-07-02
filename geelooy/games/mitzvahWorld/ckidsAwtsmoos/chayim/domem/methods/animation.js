// B"H
/**
 * @file animation.js
 * @description Fast animation state changes without letting worker-side GLB
 * mixer work stall gameplay simulation.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

const WORKER_MIXER_FLAG = "__AWTSMOOS_ENABLE_WORKER_PLAYER_MIXER__";
const PERF_MIXER_FLAG = "__AWTSMOOS_ENABLE_PERF_MIXER__";
const now = () => typeof performance !== "undefined" ? performance.now() : Date.now();

function finite(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function defaultBlend(entity) {
    return Math.max(0.035, Math.min(0.18, finite(entity?.animationBlendDuration, 0.075)));
}

function isWorkerScope() {
    return typeof document === "undefined";
}

function isPlayerLike(entity) {
    return Boolean(entity?.type === "chossid" || entity?.olam?.chossid === entity || entity?.olam?.player === entity);
}

function perfModeActive(entity) {
    return Boolean(globalThis.__AWTSMOOS_PERFORMANCE_MODE__ || entity?.olam?.baseInfo?.compact || entity?.olam?.baseInfo?.testWorldFlags?.compact);
}

function shouldAdvanceMixer(entity) {
    if (!entity?.currentAnimationPlaying || !entity?.animationMixer) return false;
    if (isWorkerScope() && isPlayerLike(entity) && globalThis[WORKER_MIXER_FLAG] !== true) return false;
    if (perfModeActive(entity) && globalThis[PERF_MIXER_FLAG] === false) return false;
    return true;
}

function hasListeners(entity, name) {
    return Boolean(entity?.events?.[name]?.length);
}

function clipMap(entity) {
    if (!entity.__awtsmoosClipActionByKey) entity.__awtsmoosClipActionByKey = new Map();
    return entity.__awtsmoosClipActionByKey;
}

function findClip(entity, shaym) {
    const key = String(shaym || "").toLowerCase();
    if (!key || !entity.animations?.length) return null;
    const cache = clipMap(entity);
    if (cache.has(key)) return cache.get(key);
    const clip = entity.animations.find(anim => anim.name.toLowerCase().includes(key)) || null;
    cache.set(key, clip);
    return clip;
}

function recordAnimationCost(entity, cost, advanced) {
    if (!isPlayerLike(entity)) return;
    const bag = entity.__awtsmoosPlayerAnimationStats || { frames:0, advanced:0, skipped:0, totalMs:0, maxMs:0 };
    bag.frames += 1;
    if (advanced) bag.advanced += 1;
    else bag.skipped += 1;
    bag.totalMs += cost;
    bag.maxMs = Math.max(bag.maxMs, cost);
    bag.lastMs = Math.round(cost * 10) / 10;
    bag.avgMs = Math.round((bag.totalMs / Math.max(1, bag.frames)) * 10) / 10;
    bag.workerMixerDisabled = isWorkerScope() && globalThis[WORKER_MIXER_FLAG] !== true;
    entity.__awtsmoosPlayerAnimationStats = bag;
    entity.olam && (entity.olam.__lastPlayerAnimationStats = bag);
}

export default {
    heesHawvoos(deltaTime) {
        if (this.removed) return;
        Nivra.prototype.heesHawvoos.call(this, deltaTime);
        if (hasListeners(this, "heesHawvoos")) this.ayshPeula("heesHawvoos", this);
        const started = now();
        const advance = shouldAdvanceMixer(this);
        if (advance) this.animationMixer.update(deltaTime);
        recordAnimationCost(this, now() - started, advance);
    },

    clipActions: {},
    nextAction: null,
    currentAction: null,

    resetChaweeyoos(shaym) {
        const clip = findClip(this, shaym);
        if (!clip) return;
        const action = this.animationMixer.clipAction(clip);
        if (!this.clipActions[shaym]) this.clipActions[shaym] = action;
        action?.reset();
    },

    playChayoos(shaym, op) { this.playChaweeyoos(shaym, op); },

    playChaweeyoos(shaym, options = {}) {
        if (!shaym || !this.animationMixer || !this.animations || this.animations.length === 0) return;
        const duration = finite(options.duration, defaultBlend(this));
        const loop = options.loop !== false;
        const clip = findClip(this, shaym);
        if (!clip) {
            if (String(shaym).toLowerCase() !== "idle") this.playChaweeyoos("idle", options);
            return;
        }

        const newAction = this.animationMixer.clipAction(clip);
        if (this.currentAction === newAction && !options.force) return;
        const oldAction = this.currentAction;
        this.currentAction = newAction;
        newAction.reset();
        newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        newAction.clampWhenFinished = !loop;
        newAction.enabled = true;
        newAction.setEffectiveWeight(1);
        newAction.timeScale = finite(options.timeScale, finite(this.animationActionTimeScale, 1));

        if (oldAction) oldAction.crossFadeTo(newAction, duration, true);
        else newAction.fadeIn(duration);

        newAction.play();
        this.currentAnimationPlaying = true;

        if (!loop) {
            const onFinished = event => {
                if (event.action !== newAction) return;
                this.animationMixer.removeEventListener('finished', onFinished);
                if (typeof options.done === 'function') options.done();
            };
            this.animationMixer.addEventListener('finished', onFinished);
        }
    },

    getChaweeyoos() {
        if (!this.animations) return [];
        this.chaweeyoos = this.animations.map(q => q.name);
        return this.chaweeyoos;
    },

    simplePlayOnceAnimation(shaym) { this.playChaweeyoos(shaym, { loop: false, duration: defaultBlend(this) }); }
};
