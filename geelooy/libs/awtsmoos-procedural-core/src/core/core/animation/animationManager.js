
// B"H
/**
 * @file animationManager.js
 * @brief Conduit for layering skeletal desire upon binded form.
 * 
 * POEM OF THE LAYERED WILL:
 * The Bind is the Decree, the Law of the place,
 * Fixed in the void with a holy grace.
 * Before we dance, before we move,
 * We return to the root, the bind-pose groove.
 * Then the tracks descend, like rain on the field,
 * Until the true motion is fully revealed.
 */
import { mat4_core } from '../math/mat4/core.js'; 
import { mat4_transformations } from '../math/mat4/transformations.js'; 
import { AnimationMixer } from './mixer.js';

export class AnimationManager {
    tracks = {}; 
    objectAnimations = {}; 

    registerTrack(name, data) {
        let kf = (data && !Array.isArray(data)) ? data.keyframes : data;
        if (!kf || kf.length === 0) return;
        const sorted = [...kf].sort((a, b) => a.time - b.time);
        this.tracks[name] = { keyframes: sorted, duration: sorted[sorted.length - 1].time };
    }

    registerObject(objectId, configs) {
        this.objectAnimations[objectId] = configs || [];
    }
    
    /**
     * B"H - Applies local animations to a skeleton.
     * @param {Skeleton} skeleton 
     * @param {string} objectId 
     * @param {number} globalTime 
     */
    updateSkeleton(skeleton, objectId, globalTime) {
        if (!skeleton || !this.objectAnimations[objectId]) return;
        const configs = this.objectAnimations[objectId];

        // 1. RE-ESTABLISH BIND POSE
        // Crucial: Copy the bind matrix to local so we start from our designed origin!
        skeleton.bones.forEach(bone => {
            bone.localMatrix = [...bone.bindMatrix]; 
        });

        // 2. LAYER ANIMATIONS
        configs.forEach(config => {
            if (!config.boneId) return;
            const bone = skeleton.getBoneById(config.boneId);
            const track = this.tracks[config.track];
            
            if (bone && track) {
                const weight = config.weight !== undefined ? config.weight : 1.0;
                if (weight <= 0.001) return; // Ignore invisible light

                const mat = this._getTrackMatrix(track, globalTime, config.speed, config.offset);
                
                if (weight >= 0.999) {
                    // Absolute multiplication: Local = Local * Animation
                    mat4_core.multiply(bone.localMatrix, bone.localMatrix, mat);
                } else {
                    // Weighted blending for crossfades
                    const blended = AnimationMixer.blendMatrices(mat4_core.identity(), mat, weight);
                    mat4_core.multiply(bone.localMatrix, bone.localMatrix, blended);
                }
            }
        });
        
        // After updating locals, let the skeleton cascade down its chain.
        skeleton.updateWorldMatrices();
    }
    
    getInterpolatedTransform(objectId, globalTime) {
        const configs = this.objectAnimations[objectId];
        const objConfigs = configs ? configs.filter(c => !c.boneId) : [];
        if (objConfigs.length === 0) return mat4_core.identity();

        let finalMat = mat4_core.identity();
        objConfigs.forEach(config => {
            const track = this.tracks[config.track];
            if (!track) return;
            const weight = config.weight !== undefined ? config.weight : 1.0;
            const mat = this._getTrackMatrix(track, globalTime, config.speed, config.offset);
            const weightedMat = (weight >= 1.0) ? mat : AnimationMixer.blendMatrices(mat4_core.identity(), mat, weight);
            mat4_core.multiply(finalMat, finalMat, weightedMat);
        });
        return finalMat;
    }
    
    _getTrackMatrix(track, globalTime, speed = 1.0, offset = 0) {
        let localTime = (globalTime * speed) + offset;
        if (track.duration > 0) {
             localTime %= track.duration;
             if (localTime < 0) localTime += track.duration;
        }
        return this._evaluateTrack(track, localTime);
    }

    _evaluateTrack(track, time) {
        const kf = track.keyframes;
        let kf1 = kf[0], kf2 = kf[kf.length - 1];
        for (let i = 0; i < kf.length - 1; i++) {
            if (time >= kf[i].time && time < kf[i+1].time) {
                kf1 = kf[i]; kf2 = kf[i+1]; break;
            }
        }
        let t = (kf1 === kf2) ? 0 : (time - kf1.time) / (kf2.time - kf1.time);
        
        const p = this._lerp3(kf1.position || [0,0,0], kf2.position || [0,0,0], t);
        const r = this._lerp3(kf1.rotation || [0,0,0], kf2.rotation || [0,0,0], t);
        const s = this._lerp3(kf1.scale || [1,1,1], kf2.scale || [1,1,1], t);

        let m = mat4_core.identity(); 
        mat4_transformations.translate(m, p); 
        mat4_transformations.rotateX(m, r[0]); 
        mat4_transformations.rotateY(m, r[1]); 
        mat4_transformations.rotateZ(m, r[2]);
        mat4_transformations.scale(m, s);
        return m;
    }

    _lerp3(a, b, t) { 
        return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2])]; 
    }
}
