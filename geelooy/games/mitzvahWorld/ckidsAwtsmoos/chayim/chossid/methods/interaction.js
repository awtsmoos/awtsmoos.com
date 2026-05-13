
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
        if (this.olam) {
            if(e.clientX !== undefined) {
                 const rect = this.olam.boundingRect;
                 if(rect) {
                     this.olam.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                     this.olam.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                 }
            }
            this.checkHover(this.olam, true); 
        }

        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            // B"H: silent


            if (
                niv.type === 'customNpc' ||
                niv.type === 'medabeir' ||
                niv.type === 'interactiveNpc' ||
                niv.dialogue ||
                niv.dialogues ||
                niv.type === 'interactiveDoor'
            ) {
                if (typeof niv.ayshPeula === 'function') {
                    niv.ayshPeula("accepted interaction", this);
                }
                return;
            }

            this.selectIntersected();
        } else {
            // B"H: No interactive entity found, default to tool usage (attacking/building)
            if (typeof this.shoot === 'function') {
                this.shoot();
            }
        }
    },

    async selectIntersected() {
        if(!this.intersected) return;
        if(this.selected) return;
        
        this.setEntityHighlight(this.intersected.niv.mesh, true, 0xdd0022); 
        
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
            if (typeof this.intersected.niv.ayshPeula === 'function') {
                this.intersected.niv.ayshPeula("mouseLeave", this);
            }
        }
        
        this.olam.hoveredNivra = null;
        this.intersected = null;
        this.selected = null;
        
        this.olam.htmlAction({
            shaym: "block selector menu",
            methods: { classList: { add: ["hidden"] } }
        });
        
        this.olam.htmlAction({
            shaym: "minimap label",
            methods: { classList: { add: "invisible" } }
        });
        
        this.olam.htmlAction({
            selector: "body",
            properties: { style: { cursor: "default" } }
        });
        
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
    
    setEntityHighlight(rootObj, active, colorHex = 0x00ff00) {
        if (!rootObj) return;
        
        rootObj.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                
                if (active) {
                    if (!child.userData.savedEmissive) {
                        child.userData.savedEmissive = materials.map(m => m.emissive ? m.emissive.getHex() : 0);
                        child.userData.savedIntensity = materials.map(m => m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1);
                    }
                    materials.forEach(m => {
                        if (m.emissive) {
                            m.emissive.setHex(colorHex);
                            if(m.emissiveIntensity !== undefined) m.emissiveIntensity = 0.6; 
                        }
                    });
                } else {
                    if (child.userData.savedEmissive) {
                        materials.forEach((m, i) => {
                            if (m.emissive) m.emissive.setHex(child.userData.savedEmissive[i]);
                            if (m.emissiveIntensity !== undefined) m.emissiveIntensity = child.userData.savedIntensity[i];
                        });
                        delete child.userData.savedEmissive;
                        delete child.userData.savedIntensity;
                    } else {
                         materials.forEach(m => { if(m.emissive) m.emissive.setHex(0); });
                    }
                }
            }
        });
    },

    async checkHover(olam, nohtml = true) {
        if(!olam.isLookingForSomething) return;
        
        // B"H: IF we are over UI or busy, DO NOT process hover logic that shows prompts.
        if (olam.isOverUI || (olam.chossid && (olam.chossid.state === 'talking' || olam.chossid.nivraTalkingTo))) {
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
             this.removeIntersected();
             return;
        }

        var hit = olam.ayin.getHovered(
            this.getRayStart(),
            this.getRayDirection()
        );
            
        var ob = hit?.object;
        var niv = hit?.nivraAwtsmoos || ob?.nivraAwtsmoos;
        
        if (!niv && ob) {
             let p = ob;
             while(p && !p.nivraAwtsmoos && p.parent) {
                 p = p.parent;
             }
             if(p && p.nivraAwtsmoos) {
                 niv = p.nivraAwtsmoos;
             }
        }
        
        if (this.intersected && this.intersected.niv !== niv) {
            this.removeIntersected();
        }
        
        if(niv && !niv.wasSealayked && niv.type != "chossid") {
            niv.isHoveredOver = true;
            
            if(this.intersected?.niv !== niv) {
                if (typeof niv.ayshPeula === 'function') {
                    niv.ayshPeula("mouseEnter", this);
                }
                
                this.intersected = {niv, ob, hit};
                olam.hoveredNivra = niv;
                
                if(!nohtml) {
                    olam.htmlAction({
                        selector: "body",
                        properties: { style: { cursor: "pointer" } }
                    });
                }
            }

            const isNPC = niv.type === 'customNpc' || niv.type === 'medabeir' || niv.type === 'interactiveNpc';
            if ((niv.dialogue || niv.dialogues || ob?.hasDialogue || isNPC) && !nohtml) {
                 let inRange = false;
                 if (isNPC && olam.chossid) {
                     const dist = olam.chossid.mesh.position.distanceTo(niv.mesh.position);
                     if (dist <= (niv.proximity || 5)) {
                         inRange = true;
                     }
                 } else {
                     inRange = hit.distance < 10;
                 }

                 const makeMessage = async () => {
                        var msg = "B\"H\n" + (niv.name || "Friend");
                        if(!inRange && isNPC) {
                             msg += "\n(Get closer to talk)";
                        } else if(isNPC) {
                             msg += "\n(Click or Press C to Talk)";
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
