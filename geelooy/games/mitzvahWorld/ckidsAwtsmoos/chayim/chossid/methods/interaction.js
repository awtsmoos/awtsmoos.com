
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

    async selectIntersected() {
        if(!this.intersected) return;
        if(this.selected) return;
        
        this.intersected.ob.material.emissive.setHex(0xdd0022);
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
        if(!this.selected && !this.intersected) return;
        
        if(this.intersected) {
            this.intersected.niv.isHoveredOver = false;
            this.intersected.ob.material.emissive.setHex(0x00);
        }
        this.olam.hoveredNivra = null;
        this.intersected = null;
        this.selected = null;
        
        this.olam.htmlAction({
            shaym: "block selector menu",
            methods: { classList: { add: ["hidden"] } }
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

    async checkHover(olam, nohtml = true) {
        if(!olam.isLookingForSomething) return;
        
        var intersected = this.intersected;
        var hit = olam.ayin.getHovered(
            this.getRayStart(),
            this.getRayDirection()
        );
            
        var ob = hit?.object;
        var niv = ob?.nivraAwtsmoos;
        
        if(niv && !niv.wasSealayked && niv.type != "chossid") {
            niv.isHoveredOver = true;
            if(intersected && intersected?.niv != niv) {
                this.removeIntersected();
            }
            if((niv.dialogue || ob.hasDialogue)) {
                const makeMessage = async ({tooFar=false, gone=false}={}) => {
                    if(gone) {
                        if(!nohtml) await olam.ayshPeula("hide label");
                        return;
                    }
                    var msg = "This is: " + niv.name;
                    if(!niv.inRangeNivra || tooFar) {
                        msg += ".\nYou are too far away. Come closer!"
                    }
                    var tx = olam.achbar.x;
                    var ty = olam.achbar.y;
                    
                    if(!nohtml)
                        await olam.htmlAction({
                            shaym: "minimap label",
                            properties: {
                                innerHTML:msg,
                                style: { transform:`translate(${tx}px, ${ty}px)` }
                            },
                            methods: { classList: { remove: "invisible" } }
                        });
                };

                if(!nohtml) await makeMessage();
                
                if(intersected?.niv != niv) {
                    var color = 0xff0000;
                    if(niv?.wasApproached) color = 0x00ff00;
                    
                    if(!ob.material.awtsmoosifized) {
                        var nm = ob.material.clone();
                        nm.awtsmoosifized = true;
                        nm.needsUpdate = true;
                        ob.material = nm;
                    }

                    niv.on("someone left", async () => {
                        if(!niv.isHoveredOver) return;
                        if(!ob) {
                            if(!nohtml) await makeMessage({gone:true});
                            ob.material.emissive.setHex(0x00);
                            niv.clear("someone left");
                        } else {
                            if(!nohtml) await makeMessage({tooFar:true});
                            ob.material.emissive.setHex(0xff0000);
                        }
                    });

                    niv.on("was approached", async () => {
                        if(!niv.isHoveredOver) return;
                        if(ob) {
                            ob.material.emissive.setHex(0x00ff00);
                            await makeMessage();
                        } else {
                            ob.material.emissive.setHex(0x00);
                            niv.clear("was approached");
                        }
                    });
                    
                    this.intersected = {niv, ob, hit};
                    this.intersected.currentHex = ob.material.emissive.getHex();
                    ob.material.emissive.setHex( color );
                    olam.hoveredNivra = niv;
                    if(!nohtml)
                        olam.htmlAction({
                            selector: "body",
                            properties: { style: { cursor: "pointer" } }
                        });
                }
            } else {
                if(intersected?.niv != niv) {
                    this.intersected = {niv, ob, hit};
                    this.intersected.currentHex = ob.material.emissive.getHex();
                    ob.material.emissive.setHex(0x0000ff);
                }
            }
        } else {
            if(intersected) {
                this.removeIntersected();
            }
        }
        olam.hoveredNivra = niv;
    }
};