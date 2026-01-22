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
        
        console.log("B\"H - Starting Game Loop (HeesHawvoos) - VERBOSE DEBUG MODE");

        async function go(time) {
            if (self.destroyed) return;

            // B"H FIX: Synchronize Timer Name to avoid console flood
            const currentFrameId = frameCount;
            const debugFrame = currentFrameId < 20 || currentFrameId % 60 === 0;

            if (debugFrame) console.time(`B"H Frame ${currentFrameId}`);

            let dt = self.clock.getDelta();
            if (isNaN(dt) || dt <= 0) dt = 0.016; 
            self.deltaTime = Math.min(0.1, dt);
            
            try {
                // --- UPDATE PHASE ---
                if (debugFrame) console.log("B\"H [Loop] Updating Shlichus");
                if (self.shlichusHandler) self.shlichusHandler.update(self.deltaTime);

                if (debugFrame) console.log("B\"H [Loop] Updating Environment");
                if (self.environment) {
                    const playerPos = self.player ? self.player.mesh.position : new THREE.Vector3();
                    if(debugFrame && self.player) console.log("B\"H [Loop] Player Pos:", playerPos.x.toFixed(2), playerPos.y.toFixed(2), playerPos.z.toFixed(2));
                    
                    self.environment.update(self.deltaTime, playerPos);
                }

                if (self.mayim) {
                    self.mayim.forEach(w => {
                        if (w.material && w.material.uniforms && w.material.uniforms.time) {
                             w.material.uniforms.time.value += self.deltaTime;
                        }
                    });
                }
                
                if (debugFrame) console.log("B\"H [Loop] Updating Octree Physics");
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
                    
                if (debugFrame) console.log("B\"H [Loop] Updating Entities");
                if (self.nivrayim) {
                    for (let i = 0; i < self.nivrayim.length; i++) {
                        const n = self.nivrayim[i];
                        if (n.isReady && !n.wasSealayked && n.heesHawveh) {
                            n.heesHawvoos(self.deltaTime);
                        }
                    }
                }
                    
                if (debugFrame) console.log("B\"H [Loop] Updating Camera");
                if (self.ayin && self.ayin.target) self.ayin.update(self.deltaTime);

                // --- RENDER PHASE ---
                if (self.renderer) {
                    if (!firstTime) {
                        firstTime = true;
                        self.ayshPeula("rendered first time");
                    }
                    
                    if(debugFrame) console.log("B\"H [Loop] Calling Renderer");
                    
                    if(typeof self.renderer.renderAsync === 'function') {
                         await self.renderer.renderAsync(self.scene, self.activeCamera || self.ayin.camera);
                    } else {
                         self.renderer.render(self.scene, self.activeCamera || self.ayin.camera);
                    }
                    
                    frameCount++;
                }
                
                if (debugFrame) console.timeEnd(`B"H Frame ${currentFrameId}`);

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
