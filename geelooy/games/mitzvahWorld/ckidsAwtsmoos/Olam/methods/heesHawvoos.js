// B"H
/**
 * heesHawvoos.js - The constant game update and rendering loop.
 * Features Self-Healing Diagnostics and Deep Scene Audit.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    velz = 0;
    deltaTime = 1;
    destroyed = false;
    consecutiveErrors = 0;
    
    async heesHawvoos() {
        var self = this;
        var firstTime = false;
        var frameCount = 0;
        
        console.log("B\"H - Starting Game Loop (HeesHawvoos) - Strict Mode");

        async function go(time) {
            if (self.destroyed) return;

            let dt = self.clock.getDelta();
            if (isNaN(dt) || dt <= 0) dt = 0.016; 
            self.deltaTime = Math.min(0.1, dt);
            
            try {
                // --- UPDATE PHASE ---
                if (self.shlichusHandler) self.shlichusHandler.update(self.deltaTime);

                if (self.environment) {
                    const playerPos = self.player ? self.player.mesh.position : null;
                    self.environment.update(self.deltaTime, playerPos);
                }

                if (self.mayim) {
                    self.mayim.forEach(w => {
                        if (w.material && w.material.uniforms && w.material.uniforms.time) {
                             w.material.uniforms.time.value += self.deltaTime;
                        }
                    });
                }
                
                if (self.worldOctree) {
                    const foci = [];
                    if (self.chossid && !isNaN(self.chossid.mesh.position.x)) {
                        foci.push({ position: self.chossid.mesh.position, velocity: self.chossid.velocity });
                    }
                    
                    if (self.nivrayim) {
                        for (const n of self.nivrayim) {
                            if (n !== self.chossid && n.velocity && n.isReady && !isNaN(n.mesh.position.x)) {
                                foci.push({ position: n.mesh.position, velocity: n.velocity });
                            }
                        }
                    }
                    self.worldOctree.update(foci, null); 
                }
                    
                if (self.nivrayim) {
                    for (let i = 0; i < self.nivrayim.length; i++) {
                        const n = self.nivrayim[i];
                        if (n.isReady && !n.wasSealayked && n.heesHawveh) {
                            n.heesHawvoos(self.deltaTime);
                        }
                    }
                }
                    
                if (self.ayin && self.ayin.target) self.ayin.update(self.deltaTime);

                // --- RENDER PHASE ---
                if (self.renderer) {
                    if (!firstTime) {
                        firstTime = true;
                        self.ayshPeula("rendered first time");
                    }
                    
                    if(typeof self.renderer.renderAsync === 'function') {
                         await self.renderer.renderAsync(self.scene, self.activeCamera || self.ayin.camera);
                    } else {
                         self.renderer.render(self.scene, self.activeCamera || self.ayin.camera);
                    }
                    
                    frameCount++;
                }

            } catch (renderEx) {
                // B"H: IMMEDIATE STOP ON FIRST ERROR
                self.destroyed = true;
                
                console.group("%c B\"H - FATAL ERROR - GAME STOPPED ", "background: red; color: white; font-size: 18px; padding: 10px; font-weight: bold;");
                console.error("Execution halted immediately.");
                console.error("Error Message:", renderEx.message);
                console.error("Stack:", renderEx.stack);
                console.groupEnd();
                
                self.ayshPeula("error", {
                    code: "FATAL_LOOP_CRASH",
                    details: renderEx.stack,
                    message: "The world has been paused immediately due to an error:\n" + renderEx.message
                });
                
                return; // Stop the function here, do not request next frame.
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }
}