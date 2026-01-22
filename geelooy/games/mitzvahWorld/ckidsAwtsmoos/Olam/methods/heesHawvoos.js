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
                console.error("B\"H - Render Loop Exception:", renderEx);
                self.crashCount++;
                
                // Allow a few glitches before giving up
                if (self.crashCount > 10) {
                    self.destroyed = true;
                    console.error("B\"H - FATAL LOOP CRASH: Too many consecutive errors. Stopping world.");
                    self.ayshPeula("error", {
                        code: "FATAL_LOOP_CRASH",
                        details: renderEx.stack,
                        message: "The world has been paused due to a recurring technical limitation:\n" + renderEx.message
                    });
                    return;
                } else {
                    console.warn("B\"H - Recovering from frame error... (" + self.crashCount + "/10)");
                    // Short pause to let system stabilize
                    await new Promise(r => setTimeout(r, 100));
                }
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }
}