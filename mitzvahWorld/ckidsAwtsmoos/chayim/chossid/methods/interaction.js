

/**
 * B"H
 * @file interaction.js
 * Raycasting selection, menus, and hover checks.
 */

export default {
    actionList: {
        Delete(self) {
            self?.selected?.niv?.ayshPeula("sealayk");
        },
        Grab(self) {
            self?.selected?.niv?.ayshPeula("sealayk");
            self.removeIntersected();
            self.selected = null;
            self.intersected = null;
            self.removeRay();
            self.makeRay();
            self.placeBlockOnRay();
        }
    },

    handleClick(e) {
        // B"H: Force a hover check immediately before processing click
        // This ensures that even if mousemove didn't fire (e.g. static mouse), we find the target.
        if (this.olam) {
            // Temporarily set mouse pos if provided in event, but checkHover uses internal pointer state usually.
            // If e contains coords, we might need to update olam.pointer first.
            if(e.clientX !== undefined) {
                 const rect = this.olam.boundingRect;
                 if(rect) {
                     this.olam.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                     this.olam.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                 }
            }
            this.checkHover(this.olam, true); // true = no html updates, just logic
        }

        // B"H: Handles click on intersected entities
        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            console.log("B\"H - Clicked on:", niv.name, niv.type);

            // Prioritize Dialogue/NPC Interaction
            if (niv.type === 'customNpc' || niv.type === 'medabeir' || niv.dialogue) {
                // B"H: Trigger interaction regardless of proximity for now to fix usability
                if (typeof niv.ayshPeula === 'function') {
                    niv.ayshPeula("accepted interaction");
                }
                return;
            }

            // Fallback to Block Selection
            this.selectIntersected();
        } else {
            console.log("B\"H - Clicked but no intersection.");
        }
    },

    async selectIntersected() {
        if(!this.intersected) return;
        if(this.selected) return;
        
        // Use the new recursive highlighter
        this.setEntityHighlight(this.intersected.niv.mesh, true, 0xdd0022); // Red for selection
        
        this.selected = this.intersected;
        this.olam.htmlAction({
            shaym: "block selector menu",
            methods: { classList: { remove: "hidden" } }
        });
        
        await this.olam.ayshPeula("ui event", "block selector menu", {
            awtsmoosOptions: { lol:5 }
        });
    },

    removeIntersected() {
        if (this.intersected && this.intersected.niv) {
            this.intersected.niv.isHoveredOver = false;
            // Restore original materials
            this.setEntityHighlight(this.intersected.niv.mesh, false);
        }
        
        this.olam.hoveredNivra = null;
        this.intersected = null;
        this.selected = null;
        
        this.olam.htmlAction({
            shaym: "block selector menu",
            methods: { classList: { add: ["hidden"] } }
        });
        
        // Hide tooltip label
        this.olam.htmlAction({
            shaym: "minimap label",
            methods: { classList: { add: "invisible" } }
        });
        
        this.olam.htmlAction({
            selector: "body",
            properties: { style: { cursor: "default" } }
        });
        
        // B"H: Hide Press B prompt
        this.olam.htmlAction({
            shaym: "approach npc msg",
            methods: { classList: { add: "hidden" } }
        });
    },

    toggleSelectedMenu() {
        if(!this.currentSelectOption) {
            this.currentSelectOption = "Grab";
        }
        this.olam.ayshPeula("ui event", "menu item "+this.currentSelectOption, {
            awtsmoosHighlight: "yes"
        });
    },

    selectMenuOption() {
        this.olam.ayshPeula("ui event", "menu item "+this.currentSelectOption, {
            awtsmoosHighlight: "yes"
        });
    },
    
    // B"H: Helper to recursively highlight an object hierarchy
    setEntityHighlight(rootObj, active, colorHex = 0x00ff00) {
        if (!rootObj) return;
        
        rootObj.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                if (active) {
                    // Save state if not already highlighted
                    if (!child.userData.savedEmissive) {
                        child.userData.savedEmissive = materials.map(m => m.emissive ? m.emissive.getHex() : 0);
                        child.userData.savedIntensity = materials.map(m => m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1);
                    }
                    // Apply Highlight
                    materials.forEach(m => {
                        if (m.emissive) {
                            m.emissive.setHex(colorHex);
                            if(m.emissiveIntensity !== undefined) m.emissiveIntensity = 0.6; // Boost visibility
                        }
                    });
                } else {
                    // Restore
                    if (child.userData.savedEmissive) {
                        materials.forEach((m, i) => {
                            if (m.emissive) m.emissive.setHex(child.userData.savedEmissive[i]);
                            if (m.emissiveIntensity !== undefined) m.emissiveIntensity = child.userData.savedIntensity[i];
                        });
                        delete child.userData.savedEmissive;
                        delete child.userData.savedIntensity;
                    } else {
                        // Fallback reset
                         materials.forEach(m => { if(m.emissive) m.emissive.setHex(0); });
                    }
                }
            }
        });
    },

    async checkHover(olam, nohtml = true) {
        if(!olam.isLookingForSomething) return;
        
        // B"H: IF we are busy (talking, in a menu), DO NOT process hover logic that shows prompts.
        // This fixes prompts appearing over the Store UI.
        if (olam.chossid && (olam.chossid.state === 'talking' || olam.chossid.nivraTalkingTo)) {
            // Ensure prompt is hidden if we are stuck in a hover state visually
             if(!nohtml) {
                 olam.htmlAction({
                    shaym: "approach npc msg",
                    methods: { classList: { add: "hidden" } }
                 });
                 olam.htmlAction({
                    selector: "body",
                    properties: { style: { cursor: "default" } }
                 });
             }
             return;
        }

        // Perform Raycast (this now checks both Octree AND Dynamic Entities)
        var hit = olam.ayin.getHovered(
            this.getRayStart(),
            this.getRayDirection()
        );
            
        var ob = hit?.object;
        // B"H: Check if hit result explicitly contains the nivra reference (added in collision.js)
        var niv = hit?.nivraAwtsmoos || ob?.nivraAwtsmoos;
        
        // B"H: Robust bubble-up to find parent Nivra if ray hit a child mesh
        if (!niv && ob) {
             let p = ob;
             // Traverse up until we find nivraAwtsmoos or hit root
             while(p && !p.nivraAwtsmoos && p.parent) {
                 p = p.parent;
             }
             if(p && p.nivraAwtsmoos) {
                 niv = p.nivraAwtsmoos;
             }
        }
        
        // If changed target, cleanup old one
        if (this.intersected && this.intersected.niv !== niv) {
            this.removeIntersected();
        }
        
        if(niv && !niv.wasSealayked && niv.type != "chossid") {
            niv.isHoveredOver = true;
            
            // B"H: Update Highlight only if target changed
            if(this.intersected?.niv !== niv) {
                // Determine highlight color based on type
                const isNPC = niv.type === 'customNpc' || niv.type === 'medabeir';
                const highlightColor = isNPC ? 0x00ff00 : 0x0000ff;
                
               // console.log("B\"H - Hovering over:", niv.name, niv.type);

                // Highlight the entire mesh hierarchy
                this.setEntityHighlight(niv.mesh, true, highlightColor);
                
                this.intersected = {niv, ob, hit};
                olam.hoveredNivra = niv;
                
                if(!nohtml) {
                    olam.htmlAction({
                        selector: "body",
                        properties: { style: { cursor: "pointer" } }
                    });
                }
            }

            // B"H FIX: ALWAYS check range and update prompts, even if target didn't change!
            // This ensures walking away hides the prompt.
            const isNPC = niv.type === 'customNpc' || niv.type === 'medabeir';
            if ((niv.dialogue || ob?.hasDialogue || isNPC) && !nohtml) {
                 let inRange = false;
                 // Calculate distance if it's an NPC/Medabeir
                 if (isNPC && olam.chossid) {
                     const dist = olam.chossid.mesh.position.distanceTo(niv.mesh.position);
                     if (dist <= (niv.proximity || 5)) {
                         inRange = true;
                     }
                 } else {
                     // For non-NPCs with dialogue (e.g. signs), assume hover is enough or use ray distance
                     inRange = hit.distance < 10;
                 }

                 const makeMessage = async () => {
                        var msg = "B\"H\n" + (niv.name || "Friend");
                        if(!inRange && isNPC) {
                             msg += "\n(Get closer to talk)";
                        } else if(isNPC) {
                             msg += "\n(Click or Press B to Talk)";
                        }
                        
                        var tx = olam.achbar.x;
                        var ty = olam.achbar.y;
                        
                        await olam.htmlAction({
                            shaym: "minimap label",
                            properties: {
                                innerHTML: msg,
                                style: { transform:`translate(${tx}px, ${ty}px)` }
                            },
                            methods: { classList: { remove: "invisible" } }
                        });
                        
                        // B"H: Also update "Press B" persistent prompt based on RANGE
                        if (isNPC) {
                             if (inRange) {
                                 await olam.htmlAction({
                                    shaym: "approach npc msg",
                                    properties: { textContent: niv.name },
                                    methods: { classList: { remove: "hidden" } }
                                 });
                             } else {
                                 await olam.htmlAction({
                                    shaym: "approach npc msg",
                                    methods: { classList: { add: "hidden" } }
                                 });
                             }
                        }
                };
                await makeMessage();
            }

        } else {
            if(this.intersected) {
                this.removeIntersected();
            }
        }
        olam.hoveredNivra = niv;
    }
};
