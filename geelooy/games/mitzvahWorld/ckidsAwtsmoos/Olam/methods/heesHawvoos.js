
// B"H
/**
 * @file heesHawvoos.js
 * @description
 * 🌀 THE CYCLE OF CONSTANT RECREATION 🌀
 * 
 * Chapter 108: The Dance of Creation.
 * 
 * This module provides the 'Act' called by the Pulsator. It must be FAST.
 * Every nanosecond saved here is a spark of Light added to the FPS.
 * It is structured into 4 specific pillars of reality:
 * 1. Spiritual Logic (Souls)
 * 2. Physical Truth (Foundations/Physics)
 * 3. Perceiving Eye (Camera)
 * 4. Dimensional Manifestation (Render)
 */
import UniversePulsator from '../oyved/UniversePulsator.js';
import * as THREE from '/games/scripts/build/three.module.js';

export default class HeesHawvoosManager {
    async heesHawvoos() {
        const self = this;
        let confirmedGaze = false;
        let stabilityCounter = 0;

        // B"H: The Rhythmic Step function
        this.updateStep = (dt) => {
            // Pillar 1: World Equilibrium
            if (self.shlichusHandler) self.shlichusHandler.update(dt);
            if (self.environment) self.environment.update(dt);

            // Pillar 2: Stability of Ground (Physics)
            if (self.worldOctree && self.player?.mesh) {
                // Background Creation happens only where the soul is focused
                self.worldOctree.update(self.player.mesh.position, self.player.velocity);
            }

            // Pillar 3: Individuality of Choice (Souls)
            for (let i = 0; i < self.nivrayim.length; i++) {
                const nivra = self.nivrayim[i];
                if (nivra.isReady && nivra.heesHawveh) {
                    try {
                        nivra.heesHawvoos(dt);
                    } catch(err) { /* Silence fragmented errors to keep loop steady */ }
                }
            }

            // Pillar 4: Adjusting Perspective
            if (self.ayin?.update) self.ayin.update(dt);

            // THE MANIFESTATION: PROJECTION OF LIGHT
            if (self.renderer && self.scene) {
                const activeEye = self.activeCamera || (self.ayin ? self.ayin.camera : null);
                
                if (activeEye) {
                    self.renderer.render(self.scene, activeEye);
                    
                    // The Final Signaling Handshake
                    if (!confirmedGaze && stabilityCounter > 5) {
                        console.log("B\"H - ✨ REVELATION SUCCESS: Matrix visible. Opening gates.");
                        confirmedGaze = true;
                        self.ayshPeula("rendered first time");
                    }
                    stabilityCounter++;
                }
            }
        };

        // Ignite the Engine
        this.pulsator = new UniversePulsator(this);
        this.pulsator.ignite();
    }
}
