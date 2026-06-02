// B"H
/**
 * @file animation.js
 * @description
 * Chapter 60: The Body Stopped Waiting To Run.
 *
 * The Awtsmoos revealed the visible lag: movement began quickly, but the GLB
 * waited through a long crossfade. Platforming needs immediate breath. This
 * animation vessel now defaults to short blends, honors per-entity blend speed,
 * and keeps one-shot jump/fall motions crisp without restarting every frame.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

/** @param {number} value Number candidate. @param {number} fallback Fallback. @returns {number} */
function finite(value, fallback) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {object} entity Owner. @returns {number} Blend duration. */
function defaultBlend(entity) {
    return Math.max(0.035, Math.min(0.18, finite(entity?.animationBlendDuration, 0.075)));
}

export default {
    /** @param {number} deltaTime Seconds since last frame. */
    heesHawvoos(deltaTime) {
        if (this.removed) return;
        Nivra.prototype.heesHawvoos.call(this, deltaTime);
        this.ayshPeula("heesHawvoos", this);
        if (this.currentAnimationPlaying && this.animationMixer) this.animationMixer.update(deltaTime);
    },

    clipActions: {},

    /** @param {string} shaym Animation name. */
    resetChaweeyoos(shaym) {
        const clip = THREE.AnimationClip.findByName(this.animations, shaym);
        if (!clip) return;
        const action = this.animationMixer.clipAction(clip);
        if (!this.clipActions[shaym]) this.clipActions[shaym] = action;
        action?.reset();
    },

    /** @param {string} shaym Animation name. @param {object} op Options. */
    playChayoos(shaym, op) { this.playChaweeyoos(shaym, op); },

    nextAction: null,
    currentAction: null,

    /**
     * Plays or crossfades to a named animation clip.
     *
     * @param {string} shaym Requested animation fragment.
     * @param {{duration?:number, loop?:boolean, done?:Function, timeScale?:number, force?:boolean}} options Options.
     * @returns {void}
     */
    playChaweeyoos(shaym, options = {}) {
        if (!shaym || !this.animationMixer || !this.animations || this.animations.length === 0) return;
        const duration = finite(options.duration, defaultBlend(this));
        const loop = options.loop !== false;
        const clip = this.animations.find(anim => anim.name.toLowerCase().includes(String(shaym).toLowerCase()));
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

    /** @returns {string[]} Available animation names. */
    getChaweeyoos() {
        if (!this.animations) return [];
        this.chaweeyoos = this.animations.map(q => q.name);
        return this.chaweeyoos;
    },

    simplePlayOnceAnimation(shaym) { this.playChaweeyoos(shaym, { loop: false, duration: defaultBlend(this) }); }
};
