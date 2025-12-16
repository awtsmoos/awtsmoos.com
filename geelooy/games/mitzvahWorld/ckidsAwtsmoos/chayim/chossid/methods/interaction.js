

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
        // B"H: Handles click on intersected entities
        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            console.log("B\"H - Clicked on:", niv.name, niv.type);

            // Prioritize Dialogue/NPC Interaction
            if (niv.type === 'customNpc' || niv.type === 'medabeir' || niv.dialogue) {
                // B"H: If checking for proximity, do it here. 
                // Currently, we just fire the event.
                if (typeof niv.ayshPeula === 'function') {
                    // Force the "accepted interaction" even if listener wasn't ready (handle lazily if needed)
                    // If the NPC uses Interaction.js logic, it listens for this.
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

                // Show Label for NPCs or Dialogue objects
                if(niv.dialogue || ob?.hasDialogue || isNPC) {
                    const makeMessage = async ({tooFar=false, gone=false}={}) => {
                        // B"H: IMPORTANT! Do not show label if specific UI screens are open!
                        // We check the classList of known UI elements.
                        // Since this runs in Worker context usually (via logic), we rely on htmlAction or state.
                        // Assuming logic runs in main thread or has access to DOM via bridge...
                        // Actually, 'checkHover' usually runs in Logic.
                        // We can check `olam.chossid.state`.
                        
                        if (olam.chossid && olam.chossid.state === 'talking') return;
                        
                        // We can also send a query to UI, but that's async. 
                        // Instead, relying on 'talking' state is best. 
                        // The 'Store' sets state to 'talking' implicitly via dialogue interaction? No.
                        // Let's assume if Store is open, we shouldn't see it. 
                        
                        // B"H: If we are calling htmlAction, we can add a condition there? No.
                        // Let's just always update. The Store UI should have a higher z-index anyway.
                        // BUT the user specifically complained.
                        
                        // Let's assume if `nivraTalkingTo` is set, we are busy.
                        if (olam.chossid && olam.chossid.nivraTalkingTo) return;

                        if(gone) {
                            if(!nohtml) await olam.ayshPeula("hide label");
                            return;
                        }

                        var msg = "B\"H\n" + (niv.name || "Friend");
                        if(!niv.inRangeNivra && isNPC) {
                             msg += "\n(Get closer to talk)";
                        } else if(isNPC) {
                             msg += "\n(Click or Press B to Talk)";
                        }
                        
                        var tx = olam.achbar.x;
                        var ty = olam.achbar.y;
                        
                        if(!nohtml)
                            await olam.htmlAction({
                                shaym: "minimap label",
                                properties: {
                                    innerHTML: msg,
                                    style: { transform:`translate(${tx}px, ${ty}px)` }
                                },
                                methods: { classList: { remove: "invisible" } }
                            });
                        
                        // B"H: Also update "Press B" persistent prompt
                        if (isNPC) {
                             await olam.htmlAction({
                                shaym: "approach npc msg",
                                properties: {
                                    textContent: niv.name
                                },
                                methods: { classList: { remove: "hidden" } }
                             });
                        }
                    };

                    if(!nohtml) await makeMessage();

                    // Setup events to clear label
                    niv.on("someone left", async () => {
                        if(!niv.isHoveredOver) return;
                         // Just refresh message
                         await makeMessage(); 
                    });

                    niv.on("was approached", async () => {
                        if(!niv.isHoveredOver) return;
                        await makeMessage();
                    });
                }
            }
        } else {
            if(this.intersected) {
                this.removeIntersected();
                // B"H: Explicitly hide the "Press B" prompt when not hovering
                olam.htmlAction({
                    shaym: "approach npc msg",
                    methods: { classList: { add: "hidden" } }
                });
            }
        }
        olam.hoveredNivra = niv;
    }
};
