//B"H
/**
 * B"H
 * @file visuals.js
 * Visual representation logic: Garments, Body Parts (Goof), and Mood.
 * Features Emotion Sparks and Procedural Head Tracking.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    garmentsDefault: {
        glasses: true,
        jacket: true,
        "top-hat": false,
    },
    
    // --- B"H: Procedural Appearance & Chayus ---
    
    randomizeAppearance() {
        if (!this.materials) return;
        Object.values(this.materials).forEach(mat => {
            if (!mat.name) return;
            const lower = mat.name.toLowerCase();
            if (lower.includes('skin')) mat.color.setHSL(0.08, 0.5 + Math.random() * 0.2, 0.4 + Math.random() * 0.4);
            else if (lower.includes('shirt')) mat.color.setHSL(Math.random(), 0.7, 0.5);
        });
    },
    
    updateAutonomic(dt) {
        // 1. Blinking
        if (this.nextBlinkTime === undefined) this.nextBlinkTime = Math.random() * 3 + 2;
        this.nextBlinkTime -= dt;
        if (this.nextBlinkTime <= 0) {
            this.blink();
            this.nextBlinkTime = Math.random() * 4 + 2;
        }

        // 2. Breathing
        if (this._cachedSpine) {
             const t = Date.now() * 0.002;
             const breath = 1.0 + Math.sin(t) * 0.02;
             this._cachedSpine.scale.set(breath, breath, breath);
        } else { this._findSpine(); }

        // 3. Emotion Sparks
        if (this.lev && Math.random() < 0.1) {
            this.emitEmotionSparks();
        }
    },

    emitEmotionSparks() {
        if (!this.lev || !this.mesh) return;
        let color = 0xFFD700; // Gold (Joy)
        let count = 0;

        if (this.lev.kaas > 0.6) {
            color = 0xFF4500; // Red (Anger)
            count = Math.floor(this.lev.kaas * 3);
        } else if (this.lev.simcha > 0.7) {
            count = Math.floor(this.lev.simcha * 5);
        }

        if (count > 0) {
            this.spawnHebrewParticles(this.mesh.position.clone().add(new THREE.Vector3(0, this.height, 0)), count);
        }
    },
    
    _findSpine() {
        if(!this.mesh) return;
        this.mesh.traverse(c => { if(c.isBone && c.name.toLowerCase().includes("spine")) this._cachedSpine = c; });
    },

    blink() {
        if (this._cachedLeftEye && this._cachedRightEye) {
             const originalScale = this._cachedLeftEye.scale.y;
             this._cachedLeftEye.scale.y = 0.1;
             this._cachedRightEye.scale.y = 0.1;
             setTimeout(() => {
                 if(this._cachedLeftEye) this._cachedLeftEye.scale.y = originalScale;
                 if(this._cachedRightEye) this._cachedRightEye.scale.y = originalScale;
             }, 150);
        } else {
            if(!this._checkedForEyes && this.boneChildren) {
                this._checkedForEyes = true;
                const keys = Object.keys(this.boneChildren);
                const left = keys.find(k => k.toLowerCase().includes("eye") && k.toLowerCase().includes("l"));
                const right = keys.find(k => k.toLowerCase().includes("eye") && k.toLowerCase().includes("r"));
                if(left && right) { this._cachedLeftEye = this.boneChildren[left]; this._cachedRightEye = this.boneChildren[right]; }
            }
        }
    },

    updateHeadTracking(dt) {
        if(!this._cachedHead) {
             if(!this._checkedForHead && this.boneChildren) {
                 this._checkedForHead = true;
                 const headKey = Object.keys(this.boneChildren).find(k => k.toLowerCase() === "head");
                 if(headKey) this._cachedHead = this.boneChildren[headKey];
             }
             return;
        }

        const headBone = this._cachedHead;
        let targetPos = null;

        if (this.olam.player && this.olam.player.mesh) {
            const dist = this.mesh.position.distanceTo(this.olam.player.mesh.position);
            if (dist < 10) { // Range
                targetPos = this.olam.player.mesh.position.clone();
                targetPos.y += this.olam.player.height * 0.8; 
            }
        }

        if (targetPos) {
            const localTarget = this.mesh.worldToLocal(targetPos.clone());
            const angleY = Math.atan2(localTarget.x, localTarget.z);
            const clampedY = THREE.MathUtils.clamp(angleY, -1.0, 1.0);
            this.currentHeadY = THREE.MathUtils.lerp(this.currentHeadY || 0, clampedY, dt * 5);
            this.proceduralHeadRot = { y: this.currentHeadY, x: 0 };
        } else {
            this.currentHeadY = THREE.MathUtils.lerp(this.currentHeadY || 0, 0, dt * 2);
            this.proceduralHeadRot = { y: this.currentHeadY, x: 0 };
        }
    },
    
    wear(name) { if (this.garments && this.garments[name]) this.garments[name].visible = true; },
    takeOff(name) { if (this.garments && this.garments[name]) this.garments[name].visible = false; },
    
    setSmartMaterialColor(materialName, colorHex) {
        if (this.materials && this.materials[materialName]) this.materials[materialName].color.set(colorHex);
    },

    updateJobAppearance() {
        if (!this.jobState || !this.garments) return;
        const job = this.jobState.currentJob;
        if (job === "BUILD") { this.wear("jacket"); this.setSmartMaterialColor("jacket", 0xFFA500); this.wear("top-hat"); } 
        else if (job === "CHOP") { this.takeOff("jacket"); this.wear("outer-shirt"); } 
        else { this.wear("jacket"); this.takeOff("top-hat"); }
    },

    updateAppearance() { this.updateJobAppearance(); },
    
    setupGoof() {
        if(this.goofParts && this.mesh) {
            this.goof = {}
            Object.keys(this.goofParts).forEach(q => {
                this.mesh.traverse(child => { if(child.isMesh && child.name == q) this.goof[this.goofParts[q]] = child; })
            });
        }
        if (this.type === 'medabeir' && !this.customData) this.randomizeAppearance();
    }
};