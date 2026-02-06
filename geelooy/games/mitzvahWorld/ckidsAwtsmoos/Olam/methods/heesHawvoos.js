// B"H
/**
 * heesHawvoos.js - The constant game update and rendering loop.
 * A reflection of the constant recreation of the world by the Speech of the Awtsmoos.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    velz = 0;
    deltaTime = 1;
    destroyed = false;
    crashCount = 0; // B"H: Track consecutive crashes
    
    async heesHawvoos() {
        var self = this;
        var firstTime = false;
        
        async function go(time) {
            if (self.destroyed) return;

            let dt = self.clock.getDelta();
            if (isNaN(dt) || dt <= 0) dt = 0.016; 
            self.deltaTime = Math.min(0.1, dt);
            
            try {
                // --- UPDATE PHASE ---
                if (self.shlichusHandler) self.shlichusHandler.update(self.deltaTime);

                if (self.environment) {
                    const playerPos = self.player ? self.player.mesh.position : new THREE.Vector3();
                    self.environment.update(self.deltaTime, playerPos);
                }

                if (self.mainSun && self.player && self.player.mesh) {
                    self.mainSun.shadow.camera.left = -100;
                    self.mainSun.shadow.camera.right = 100;
                    self.mainSun.shadow.camera.top = 100;
                    self.mainSun.shadow.camera.bottom = -100;
                    self.mainSun.shadow.camera.updateProjectionMatrix();
                }

                if (self.mayim) {
                    self.mayim.forEach(w => {
                        // B"H: Safety guard - Basic materials don't have uniforms!
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
                }
                
                // Reset crash count on successful frame
                self.crashCount = 0;

            } catch (renderEx) {
                console.error("B\"H - FATAL RENDER ERROR:", renderEx);
                self.destroyed = true; // STOP LOOP IMMEDIATELY
                
                // Start Binary Search Diagnostic
                await self.diagnoseRootCause(renderEx);
                return; 
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }
    
    /**
     * B"H
     * Performs a binary search through the scene graph to isolate the specific
     * object causing the WebGL crash.
     */
    async diagnoseRootCause(originalError) {
        console.group("B\"H - DIAGNOSTIC PROTOCOL INITIATED");
        console.warn("B\"H - Stopping world to isolate the vessel causing the crash.");
        
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.activeCamera || this.ayin.camera;
        
        // 1. Collect Candidates (Flatten Scene)
        const candidates = [];
        scene.traverse((obj) => {
            // Only care about things that actually render
            if (obj.isMesh || obj.isSkinnedMesh || obj.isLine || obj.isPoints || obj.isSprite) {
                if (obj.visible) {
                    candidates.push(obj);
                }
            }
        });

        console.log(`Found ${candidates.length} visible candidates.`);
        
        // Helper to test a subset
        const testSubset = async (subset) => {
            // Hide everything in the candidate list
            candidates.forEach(c => c.visible = false);
            // Show only the subset we are testing
            subset.forEach(c => c.visible = true);
            
            try {
                // Try to render
                renderer.render(scene, camera);
                return false; // No crash
            } catch (e) {
                return true; // Crashed
            }
        };

        // Binary Search
        let currentPool = candidates;
        let iteration = 0;
        const maxIterations = Math.ceil(Math.log2(candidates.length)) + 5;

        while (currentPool.length > 0 && iteration < maxIterations) {
            iteration++;
            if (currentPool.length === 1) {
                const culprit = currentPool[0];
                console.warn("%c B\"H - CULPRIT IDENTIFIED: ", "background: red; color: white; font-size:16px", culprit.name);
                console.log("Object:", culprit);
                console.log("Material:", culprit.material);
                
                // Inspect Uniforms if present
                if (culprit.material && culprit.material.uniforms) {
                    console.table(culprit.material.uniforms);
                }
                
                this.ayshPeula("error", {
                    code: "RENDER_CULPRIT_FOUND",
                    message: `Identified crashing object: ${culprit.name} (${culprit.type})`,
                    details: originalError.toString()
                });
                
                // Neutralize: Keep the culprit hidden and try to resume?
                // For now, we just identify and leave the world destroyed so the user can see the error.
                // Or we can try to recover:
                if(confirm(`B"H - The world crashed due to object: "${culprit.name}".\n\nI have isolated it. Click OK to remove it and resume.`)) {
                     culprit.removeFromParent();
                     // Restore others
                     candidates.forEach(c => c !== culprit ? c.visible = true : null);
                     this.destroyed = false;
                     this.heesHawvoos(); // Resume loop
                } else {
                     // Just restore visibility to end state
                     candidates.forEach(c => c.visible = true);
                }
                
                console.groupEnd();
                return;
            }

            const mid = Math.floor(currentPool.length / 2);
            const left = currentPool.slice(0, mid);
            const right = currentPool.slice(mid);
            
            // Check Left
            console.log(`Diagnostic Step ${iteration}: Testing LEFT half (${left.length})...`);
            if (await testSubset(left)) {
                console.log("-> Crash detected in LEFT half.");
                currentPool = left;
                continue;
            }
            
            // Check Right
            console.log(`Diagnostic Step ${iteration}: Testing RIGHT half (${right.length})...`);
            if (await testSubset(right)) {
                console.log("-> Crash detected in RIGHT half.");
                currentPool = right;
                continue;
            }
            
            console.warn("-> Inconsistent Result: Neither half caused a crash independently.");
            // This happens if the error requires multiple objects or was transient.
            // Try testing the full pool again to confirm.
            if(await testSubset(currentPool)) {
                 console.log("-> Full pool crashes. Trying linear scan as fallback.");
                 let found = false;
                 for(let i=0; i<currentPool.length; i++) {
                     if(await testSubset([currentPool[i]])) {
                         currentPool = [currentPool[i]];
                         found = true;
                         break;
                     }
                 }
                 if(!found) {
                     console.error("Linear scan failed to isolate culprit.");
                     break;
                 }
            } else {
                console.log("-> Full pool no longer crashes. Heisenbug detected.");
                break;
            }
        }
        
        // Restore visibility if we gave up
        candidates.forEach(c => c.visible = true);
        console.groupEnd();
    }
}