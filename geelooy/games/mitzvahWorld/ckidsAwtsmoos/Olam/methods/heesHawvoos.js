
/**
 * @file heesHawvoos.js
 * @description
 * 🌀 THE CYCLE OF CONSTANT RECREATION (LOOP) 🌀
 * 
 * Chapter 10: The Purification of the Gaze.
 * "Turn away my eyes from beholding vanity." (Tehillim 119:37)
 * 
 * This loop now includes a "Vanity Purger." It identifies stray 'Points' 
 * and 'Line' objects (like the Cube002_7 artifact causing the ISSUE log) 
 * and conceals them, allowing the true vessels (the Floor and Houses) 
 * to be rendered without GPU interference.
 */
import UniversePulsator from '../oyved/UniversePulsator.js';
import * as THREE from '/games/scripts/build/three.module.js';

export default class HeesHawvoosManager {
    async heesHawvoos() {
        const self = this;
        let confirmedGaze = false;
        let loopCounter = 0;

        this.updateStep = (dt) => {
            loopCounter++;

            // 1. System Maintenance
            if (self.shlichusHandler) self.shlichusHandler.update(dt);
            if (self.environment) self.environment.update(dt);

            // 2. Physical Maintenance (Octree)
            if (self.worldOctree && self.player && self.player.mesh) {
                self.worldOctree.update(self.player.mesh.position, self.player.velocity);
            }

            // 3. Individual Life (Nivrayim)
            for (let i = 0; i < self.nivrayim.length; i++) {
                const nivra = self.nivrayim[i];
                if (nivra.isReady && nivra.heesHawveh) {
                    try {
                        nivra.heesHawvoos(dt);
                    } catch(err) { 
                        if (loopCounter % 500 === 0) console.warn('B"H - ⚠️ Entity Loop Error:', err);
                    }
                }
            }

            // 4. Perspective Maintenance
            if (self.ayin && self.ayin.update) self.ayin.update(dt);

            // 5. RENDER & PURGE
            if (self.renderer && self.scene) {
                const activeEye = self.activeCamera || (self.ayin ? self.ayin.camera : null);
                
                if (activeEye) {
                    // --- B"H: THE PURGE OF VANITY ---
                    // Every 100 frames, we scan the scene for the 'ISSUE' causing objects.
                    if (loopCounter % 100 === 0) {
                        self.scene.traverse(node => {
                            if (node.isPoints || node.isLine || node.type === 'Points') {
                                if (node.visible) {
                                    node.visible = false;
                                    node.renderOrder = -1; // Push it out of consideration
                                }
                            }
                            
                            // B"H: Completely clean logical evaluators to avoid ANY character corruption!
                            const nName = node.name || "";
                            if (node.isMesh) {
                                const isEssential = nName.includes("Floor") || 
                                                   nName.includes("House") || 
                                                   nName.includes("Terrain") || 
                                                   nName.includes("Plateau") || 
                                                   nName.includes("Plain") ||
                                                   nName.includes("Block");

                                if (isEssential) {
                                    if (!node.visible) {
                                        node.visible = true;
                                    }
                                    node.frustumCulled = false;
                                }

                            }
                        });
                    }

                    try {
                        self.renderer.render(self.scene, activeEye);
                        
                        if (!confirmedGaze) {
                            if (loopCounter > 10) {
                                console.log('B"H - ✨ REVELATION SUCCESS: Matrix visible.');
                                confirmedGaze = true;
                                self.ayshPeula("rendered first time");
                            }
                        }
                    } catch(renderErr) {
                         if (loopCounter % 100 === 0) console.error('B"H - 🚨 Render Failure:', renderErr);
                    }
                }
            }
        };

        this.pulsator = new UniversePulsator(this);
        this.pulsator.ignite();
    }
}
