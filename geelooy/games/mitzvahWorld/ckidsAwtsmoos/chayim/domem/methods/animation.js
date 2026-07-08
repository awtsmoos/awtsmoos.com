// B"H
/**
 * @file animation.js
 * @description
 * Restored from real git history 46fd68019888aa7314e4f19178b54a80026604f5.
 * The GLB mixer advances the built-in clips directly; no procedural fallback.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import Nivra from "../../nivra.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function finite(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function defaultBlend(entity) { return Math.max(0.035, Math.min(0.18, finite(entity?.animationBlendDuration, 0.075))); }
export default {
    heesHawvoos(deltaTime) {
        if (this.removed) return;
        Nivra.prototype.heesHawvoos.call(this, deltaTime);
        this.ayshPeula("heesHawvoos", this);
        if (this.currentAnimationPlaying && this.animationMixer) this.animationMixer.update(deltaTime);
    },
    clipActions: {},
    resetChaweeyoos(shaym) {
        const clip = THREE.AnimationClip.findByName(this.animations, shaym);
        if (!clip) return;
        const action = this.animationMixer.clipAction(clip);
        if (!this.clipActions[shaym]) this.clipActions[shaym] = action;
        action?.reset();
    },
    playChayoos(shaym, op) { this.playChaweeyoos(shaym, op); },
    nextAction: null,
    currentAction: null,
    playChaweeyoos(shaym, options = {}) {
        if (!shaym || !this.animationMixer || !this.animations || this.animations.length === 0) return;
        const duration = finite(options.duration, defaultBlend(this));
        const loop = options.loop !== false;
        const clip = this.animations.find(anim => anim.name.toLowerCase().includes(String(shaym).toLowerCase()));
        if (!clip) { if (String(shaym).toLowerCase() !== "idle") this.playChaweeyoos("idle", options); return; }
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
    getChaweeyoos() { if (!this.animations) return []; this.chaweeyoos = this.animations.map(q => q.name); return this.chaweeyoos; },
    simplePlayOnceAnimation(shaym) { this.playChaweeyoos(shaym, { loop: false, duration: defaultBlend(this) }); }
};
