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
            // B"H: THE DIVINE GUARD - The absolute source of the NaN infection.
            // On the first frame, dt can be 0 or NaN. We must ensure a stable heartbeat.
            // 0.016 is a safe default for a 60fps frame.
            if (isNaN(dt) || dt <= 0) dt = 0.016; 
            self.deltaTime = Math.min(0.1, dt);
            if(isNaN(self.deltaTime)) self.deltaTime = 0.016;
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
                    if (self.chossid && self.chossid.velocity && !isNaN(self.chossid.mesh.position.x)) {
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
                console.error("B\"H - FATAL RENDER ERROR. HALTING MAIN LOOP.", renderEx);
                self.destroyed = true; // STOP LOOP IMMEDIATELY

                // B"H: Use alert to completely halt script execution and inform the user.
                alert(
                    "B\"H - A fatal render error has occurred, and the world has been paused.\n\n" +
                    "Error: " + renderEx.message + "\n\n" +
                    "Check the console for details. You can now attempt to diagnose the problem."
                );
            
                // B"H: Give the user control over diagnostics.
                if (confirm("Would you like to run a diagnostic to find the object that caused the crash?")) {
                    await self.diagnoseRootCause(renderEx);
                }
                
                return; // Ensure no further execution of this frame or loop
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }
    
    /**
     * B"H
     * Performs a binary search through the scene graph using a CLEAN, ISOLATED scene
     * to find the specific object causing a WebGL rendering crash.
     */
    async diagnoseRootCause(originalError) {
        console.group("%c B\"H - DIVINE DIAGNOSTIC INITIATED ", "background: #5e1d94; color: white; font-size:14px;");
        console.warn("The world is paused to isolate a vessel causing a render error.");
        
        const renderer = this.renderer;
        const mainScene = this.scene;
        const mainCamera = this.activeCamera || this.ayin.camera;

        // 1. Create a pristine, empty Olam for testing.
        const diagnosticScene = new THREE.Scene();

        // 2. Add essential lights and camera from the main world to the diagnostic one.
        mainScene.traverse(obj => {
            if (obj.isLight) {
                diagnosticScene.add(obj.clone());
            }
        });
        diagnosticScene.add(mainCamera); // Use the same camera instance

        // 3. Collect all potential culprits (visible, renderable objects) from the main scene.
        const candidates = [];
        mainScene.traverse((obj) => {
            if (obj.visible && (obj.isMesh || obj.isSkinnedMesh || obj.isLine || obj.isPoints || obj.isSprite)) {
                candidates.push(obj);
            }
        });

        console.log(`Analyzing ${candidates.length} visible candidates...`);
        
        const testSubset = async (subset) => {
            const clones = subset.map(c => {
                const clone = c.clone(true);
                c.updateWorldMatrix(true, false);
                clone.matrix.copy(c.matrixWorld);
                clone.matrix.decompose(clone.position, clone.quaternion, clone.scale);
                diagnosticScene.add(clone);
                return clone;
            });

            try {
                renderer.render(diagnosticScene, mainCamera);
                clones.forEach(c => diagnosticScene.remove(c));
                return false; 
            } catch (e) {
                clones.forEach(c => diagnosticScene.remove(c));
                return true; 
            }
        };

        let currentPool = candidates;
        let iteration = 0;
        const maxIterations = Math.ceil(Math.log2(candidates.length || 1)) + 5;

        while (currentPool.length > 0 && iteration < maxIterations) {
            iteration++;
            console.log(`Diagnostic Step ${iteration}: Testing a pool of ${currentPool.length} objects.`);
            
            if (currentPool.length === 1) {
                const culprit = currentPool[0];
                console.warn("%c B\"H - CULPRIT IDENTIFIED ", "background: red; color: white; font-size:16px", culprit.name);
                console.log("This object is the source of the render error:", culprit);
                
                if(confirm(`B"H - Defect found in vessel: "${culprit.name}".\n\nRemove it and resume?`)) {
                    culprit.removeFromParent();
                    this.destroyed = false;
                    this.heesHawvoos();
                }
                
                console.groupEnd();
                return;
            }

            const mid = Math.floor(currentPool.length / 2);
            const leftHalf = currentPool.slice(0, mid);
            const rightHalf = currentPool.slice(mid);

            if (await testSubset(leftHalf)) {
                currentPool = leftHalf;
            } else if (await testSubset(rightHalf)) {
                currentPool = rightHalf;
            } else {
                console.error("B\"H - Inconsistent Result. Halting diagnostics.");
                break;
            }
        }
        
        if (currentPool.length > 1 || currentPool.length === 0) {
            console.error("B\"H - Diagnostic could not isolate a single culprit. The world loop remains halted.");
        }
        
        console.groupEnd();
    }
}