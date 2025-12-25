
/**
 * B"H
 * @file animation.js
 * Motion and Time.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Nivra from "../../nivra.js";

export default {
    heesHawvoos(deltaTime) {
        if(this.removed) return;
        
        // B"H: Fix for super call in object literal mixin
        Nivra.prototype.heesHawvoos.call(this, deltaTime);
        
        this.ayshPeula("heesHawvoos", this);
       
        if(this.currentAnimationPlaying != null) {
            if(this.animationMixer) {
                this.animationMixer.update(deltaTime);
                
                // B"H: Post-Mixer Procedural Adjustments
                // Apply head tracking and posture AFTER animation mixer resets bones
                
                // 1. Posture (Breathing/Emotion)
                if (this.applyProceduralPosture) this.applyProceduralPosture();
                
                // 2. Head Tracking (Hashgacha)
                // Note: Mixer overrides rotation every frame, so we add our offset here
                if (this.proceduralHeadRot && this.boneChildren && this.boneChildren['Head']) {
                    const head = this.boneChildren['Head'];
                    // We apply relative rotation accumulation
                    // Caution: Axes might differ per rig. Assuming Y is Up/Turn.
                    head.rotation.y += this.proceduralHeadRot.y;
                    head.rotation.x += this.proceduralHeadRot.x;
                }
            }
        }
    },

    clipActions: {},

    resetChaweeyoos(shaym) {
        var clip = THREE.AnimationClip.findByName(this.animations, shaym);
        if(clip) {
            var action = this.animationMixer.clipAction(clip);
            if(!this.clipActions[shaym]) {
                this.clipActions[shaym] = action;
            }
            if(action) action.reset();
        }
    },

    playChayoos(shaym, op) {
        this.playChaweeyoos(shaym, op);
    },

    nextAction: null,
    currentAction: null,

    playChaweeyoos(shaym, options = {}) {
        if (!this.animationMixer || !this.animations || this.animations.length === 0) return;

        const {
            duration = 0.36,
            loop = true,
            done
        } = options;

        // B"H: Case-insensitive search to ensure "idle" finds "Idle"
        const clip = this.animations.find(anim => 
            anim.name.toLowerCase().includes(shaym.toLowerCase())
        );
        
        if (!clip) return;

        const newAction = this.animationMixer.clipAction(clip);

        if (this.currentAction === newAction) {
            return; 
        }

        const oldAction = this.currentAction;
        this.currentAction = newAction;

        newAction.reset();
        newAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
        newAction.clampWhenFinished = !loop;
        newAction.enabled = true;
        newAction.setEffectiveWeight(1);

        if (oldAction) {
            oldAction.crossFadeTo(newAction, duration, true);
        } else {
            newAction.fadeIn(duration); 
        }

        newAction.play();
        this.currentAnimationPlaying = true;

        if (!loop) {
            const onFinished = (e) => {
                if (e.action === newAction) {
                    this.animationMixer.removeEventListener('finished', onFinished);
                    if (typeof done === 'function') {
                        done();
                    }
                }
            };
            this.animationMixer.addEventListener('finished', onFinished);
        }
    },

    getChaweeyoos() {
        if(this.animations) {
            this.chaweeyoos = this.animations.map(q=>q.name);
            return this.chaweeyoos;
        }
    },

    simplePlayOnceAnimation(shaym) {
        // Implementation placeholder logic preserved from original
    }
};
