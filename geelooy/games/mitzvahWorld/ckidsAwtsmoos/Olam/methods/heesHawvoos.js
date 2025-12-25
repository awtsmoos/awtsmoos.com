
// B"H
/**
 * heesHawvoos.js - The constant game update and rendering loop.
 * Hardened against NaN values and zero-delta frames.
 * Now drives the Environment and Weather systems.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class {
    velz = 0;
    deltaTime = 1;
    async heesHawvoos() {
        var self = this;
        var firstTime = false;
        
        console.log("B\"H - Starting Game Loop (HeesHawvoos)");

        async function go(time) {
            // Guard against zero or NaN delta
            let dt = self.clock.getDelta();
            if (isNaN(dt) || dt <= 0) dt = 0.016; // Fallback to 60fps frame time
            self.deltaTime = Math.min(0.1, dt);
            
            if (self.shlichusHandler) self.shlichusHandler.update(self.deltaTime);

            // B"H: Environment & Weather Update
            if (self.environment) {
                const playerPos = self.player ? self.player.mesh.position : null;
                self.environment.update(self.deltaTime, playerPos);
            }

            if (self.mayim) {
                self.mayim.forEach(w => {
                    if (w.material.uniforms.time) w.material.uniforms.time.value += self.deltaTime;
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
                self.nivrayim.forEach(n => 
                    n.isReady && !n.wasSealayked &&
                    (n.heesHawveh ? n.heesHawvoos(self.deltaTime) : 0)
                );
            }
                
            if (self.ayin && self.ayin.target) self.ayin.update(self.deltaTime);

            if (self.renderer) {
                if (!firstTime) {
                    firstTime = true;
                    console.log("B\"H - First Frame Rendered!");
                    self.ayshPeula("rendered first time");
                }
                self.renderer.renderAsync(self.scene, self.activeCamera || self.ayin.camera);
            }
            
            if (!self.destroyed) requestAnimationFrame(go);
        }
        requestAnimationFrame(go);
    }
}
