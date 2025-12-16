
/**
 * B"H
 * 
 * methods related to the constant
 * game update and rendering
 */

import * as THREE from '/games/scripts/build/three.module.js';

export default class {

    velz = 0;
    deltaTime = 1;
    async heesHawvoos() {
        var self = this;
        var firstTime = false;
        
        console.log("B\"H - Starting Game Loop (HeesHawvoos)");

        // This will be the loop we call every frame.
        async function go(time) {
             // Delta time (in seconds) is the amount of time that has passed since the last frame.
            // We limit it to a max of 0.1 seconds to avoid large jumps if the frame rate drops.
            self.deltaTime = Math.min(0.1, self.clock.getDelta())
            
            // 1. Shlichus Update
            if(self.shlichusHandler) {
                self.shlichusHandler.update(self.deltaTime)
            }

            // 2. Water Animation
            if(self.mayim) {
                self.mayim.forEach(w => {
                    w.material.uniforms[ 'time' ].value += 1.0 / 60.0;
                })
            }
            
            // 3. Octree Physics World Update
            // B"H: We must gather ALL "Chai" (living) entities to tell the world where to generate physics.
            // The world exists for the sake of those who inhabit it.
            if (self.worldOctree) {
                const foci = [];
                
                // Add Player
                if (self.chossid) {
                    foci.push({ 
                        position: self.chossid.mesh.position, 
                        velocity: self.chossid.velocity 
                    });
                }
                
                // Add Active NPCs (Medabeir/CustomNpc)
                if (self.nivrayim) {
                    for(const n of self.nivrayim) {
                        // Check if it's an active character with velocity (not the player, who is already added)
                        // B"H FIX: Ensure we ONLY track entities that are fully ready. 
                        // Accessing properties or positions of unready entities can cause race conditions or freezes.
                        if (n !== self.chossid && n.velocity && n.onFloor !== undefined && n.isReady) {
                            foci.push({
                                position: n.mesh.position,
                                velocity: n.velocity
                            });
                        }
                    }
                }

                // Update the World Bubble around these points
                self.worldOctree.update(foci, null); 
                
                // Periodic Cleanup Log
                if (self.frameCount === undefined) self.frameCount = 0;
                self.frameCount++;
                if (self.frameCount % 100 === 0) {
                   // self.worldOctree.scheduleStaticCleanup(); 
                }
            }
                
            // 4. Update All Creations (Nivrayim)
            if(self.nivrayim) {
                self.nivrayim.forEach(n => 
                    n.isReady && 
                    (n.heesHawveh ? n.heesHawvoos(self.deltaTime) : 0)
                );
            }
                
            // 5. Update Camera (Ayin)
            self.ayin.update(self.deltaTime);

            // 6. Rendering
            if(self.coby && self.postprocessing) {
                var rend = false//self.postprocessingRender();
                if(!rend) realRender(time);
            } else {
                realRender(time)
            }

            async function realRender() {
                // The rendering. This is done once per frame.
                if(!firstTime) {
                    firstTime = true;
                    console.log("B\"H - First Frame Rendered!");
                    self.ayshPeula("rendered first time")
                    self.ayshPeula("alert", "First time rendering " + self.renderer)
                }
                
               // self.octreeDebugHelper.box.copy(self.worldOctree.getDebugBoundingBox());
                if(self.renderer) {
                    // if(!envRendered) {
                        self.renderer.renderAsync(
                            self.scene,
                            self.activeCamera || self.ayin.camera
                        );
                    // }
                }
            }
            
            if(!self.destroyed)
                requestAnimationFrame(go);
        }
        
        requestAnimationFrame(go);
    }

    async renderMinimap() {
        async function minimapRender() {
            if(self.minimap) {
            //    await self.minimap.render()
            }
        }
       // requestAnimationFrame(minimapRender);
    }
}
