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
    
    async heesHawvoos() {
        var self = this;
        var firstTime = false;
        
        async function go(time) {
            if (self.destroyed) return;

            // 1. CONTEXT GUARD: If the renderer has lost its spirit, halt manifestation.
            if (self.renderer && self.renderer.getContext().isContextLost()) {
                console.error("B\"H - FATAL: WebGL Context Lost! The vessel has shattered.");
                self.destroyed = true;
                self.ayshPeula("error", { message: "Graphics context lost. Please reload." });
                return;
            }

            let dt = self.clock.getDelta();
            if (isNaN(dt) || dt <= 0) dt = 0.016; 
            self.deltaTime = Math.min(0.1, dt);

            try {
                // 2. MANIFESTATION THROTTLE
                // If the physics engine is heavily crunching geometry, we skip logical updates 
                // for some entities to prioritize GPU stability and prevent driver timeout.
                const isPhysicsBusy = self.worldOctree && self.worldOctree.isProcessing;

                if (self.shlichusHandler) self.shlichusHandler.update(self.deltaTime);

                if (self.environment) {
                    const playerPos = self.player ? self.player.mesh.position : new THREE.Vector3();
                    self.environment.update(self.deltaTime, playerPos);
                }

                if (self.worldOctree) {
                    const foci = [];
                    if (self.chossid && self.chossid.velocity && !isNaN(self.chossid.mesh.position.x)) {
                        foci.push({ position: self.chossid.mesh.position, velocity: self.chossid.velocity });
                    }
                    self.worldOctree.update(foci, null); 
                }
                    
                if (self.nivrayim) {
                    for (let i = 0; i < self.nivrayim.length; i++) {
                        const n = self.nivrayim[i];
                        if (n.isReady && !n.wasSealayked && n.heesHawveh) {
                            // If busy, skip updates for non-essential static objects
                            if (isPhysicsBusy && n.static) continue;
                            n.heesHawvoos(self.deltaTime);
                        }
                    }
                }
                    
                if (self.ayin && self.ayin.target) {
                    self.ayin.update(self.deltaTime);
                }

                // 3. RENDER PHASE
                if (self.renderer) {
                    if (!firstTime) {
                        firstTime = true;
                        self.ayshPeula("rendered first time");
                    }
                    
                    self.renderer.render(self.scene, self.activeCamera || self.ayin.camera);
                }

            } catch (renderEx) {
                console.error("B\"H - Render Cycle Interrupted:", renderEx);
                // We do not set destroyed=true here to allow for temporary glitch recovery
                // unless it happens repeatedly.
                self._errorCount = (self._errorCount || 0) + 1;
                if (self._errorCount > 10) self.destroyed = true;
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }
}
