
// B"H
/**
 * interaction.js - The hands of the Chossid, manipulating the world through the power of intention.
 * Refined to prevent "Basic Errors" in raycasting and accidental destruction.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    actionList: {
        async Delete(self) {
            if (!self.selected || !self.selected.niv) return;
            
            const nivName = self.selected.niv.name || "this Creation";
            
            // B"H: The Confirmation Dialogue
            const confirmResult = await self.olam.ayshPeula("send ui event", "inputModal", {
                requestInput: {
                    title: "Sacred Confirmation",
                    placeholder: `Type 'YES' to remove ${nivName}`
                }
            });

            if (confirmResult && confirmResult.value && confirmResult.value.toUpperCase() === 'YES') {
                self.selected.niv.ayshPeula("sealayk");
                self.removeIntersected();
                self.olam.ayshPeula("ui event", "effectsOverlay", { text: "Spark Redeemed", color: "#bc13fe" });
            } else {
                self.olam.ayshPeula("ui event", "effectsOverlay", { text: "Destruction Averted", color: "#4cc9f0" });
            }
        },
        Grab(self) {
            if (!self.selected || !self.selected.niv) return;
            
            const niv = self.selected.niv;
            const golem = niv.originalOptions?.golem || niv.golem;
            const itemData = niv.itemData || { 
                className: niv.constructor.name,
                name: niv.name,
                golem: golem
            };

            niv.ayshPeula("sealayk");
            self.removeIntersected();
            self.removeRay();
            self.makeRay();
            
            self.isPaintingMode = false;
            self._tempHeldItem = {
                ...itemData,
                isBuildable: true,
                id: "held_" + Date.now()
            };
            
            self.placeBlockOnRay();
        }
    },

    handleClick(e) {
        if (this.olam.chossid && (this.olam.chossid.state === 'talking' || this.olam.chossid.nivraTalkingTo)) return;

        // Simulate hover check one last time before clicking to ensure hit data is fresh
        this.checkHover(this.olam, true);

        if (this.intersected && this.intersected.niv) {
            const niv = this.intersected.niv;
            if (niv.type === 'customNpc' || niv.type === 'medabeir' || niv.dialogue) {
                if (typeof niv.ayshPeula === 'function') niv.ayshPeula("accepted interaction");
                return;
            }
            this.selectIntersected();
        } else {
            if (this.activeObject) this.placeObject();
        }
    },

    async selectIntersected() {
        if(!this.intersected || !this.intersected.niv) return;
        if(this.selected) return;
        
        this.setEntityHighlight(this.intersected.niv.mesh, true, 0xFFD700); 
        this.selected = this.intersected;
        
        this.olam.htmlAction({
            shaym: "block selector menu",
            methods: { classList: { remove: "hidden" } }
        });
        
        await this.olam.ayshPeula("ui event", "block selector menu", {
            awtsmoosOptions: { }
        });
    },

    removeIntersected() {
        if (this.intersected && this.intersected.niv) {
            this.intersected.niv.isHoveredOver = false;
            this.setEntityHighlight(this.intersected.niv.mesh, false);
        }
        this.olam.hoveredNivra = null;
        this.intersected = null;
        this.selected = null;
        this.olam.htmlAction({ shaym: "block selector menu", methods: { classList: { add: "hidden" } } });
        this.olam.htmlAction({ shaym: "minimap label", methods: { classList: { add: "invisible" } } });
    },

    setEntityHighlight(rootObj, active, colorHex = 0x00ff00) {
        if (!rootObj) return;
        rootObj.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                if (active) {
                    if (!child.userData.savedEmissive) {
                        child.userData.savedEmissive = materials.map(m => m.emissive ? m.emissive.getHex() : 0);
                    }
                    materials.forEach(m => {
                        if (m.emissive) { m.emissive.setHex(colorHex); m.emissiveIntensity = 0.5; }
                    });
                } else {
                    if (child.userData.savedEmissive) {
                        materials.forEach((m, i) => { if (m.emissive) m.emissive.setHex(child.userData.savedEmissive[i]); });
                        delete child.userData.savedEmissive;
                    }
                }
            }
        });
    },

    async checkHover(olam, nohtml = true) {
        if(!olam.isLookingForSomething) return;
        if (olam.chossid && (olam.chossid.state === 'talking' || olam.chossid.nivraTalkingTo)) return;

        // B"H: Guard coordinate normalization
        if (!olam.pointer || isNaN(olam.pointer.x)) return;

        var hit = olam.ayin.getHovered(this.getRayStart(), this.getRayDirection());
        var niv = hit?.nivraAwtsmoos || hit?.object?.nivraAwtsmoos;
        
        if (!niv && hit?.object) {
             let p = hit.object;
             while(p && !p.nivraAwtsmoos && p.parent) p = p.parent;
             if(p && p.nivraAwtsmoos) niv = p.nivraAwtsmoos;
        }
        
        if (this.intersected && this.intersected.niv !== niv) this.removeIntersected();
        
        if(niv && !niv.wasSealayked && niv.type != "chossid") {
            if(this.intersected?.niv !== niv) {
                const isNPC = niv.type === 'customNpc' || niv.type === 'medabeir';
                this.setEntityHighlight(niv.mesh, true, isNPC ? 0x00ff00 : 0x4cc9f0);
                this.intersected = {niv, hit};
                if(!nohtml) olam.htmlAction({ selector: "body", properties: { style: { cursor: "pointer" } } });
            }

            if (!nohtml) {
                const dist = olam.chossid.mesh.position.distanceTo(niv.mesh.position);
                const inRange = dist <= (niv.proximity || 5);
                
                await olam.htmlAction({
                    shaym: "minimap label",
                    properties: {
                        innerHTML: `B"H\n${niv.name || 'Creation'}\n${inRange ? '(Click to Interact)' : '(Get Closer)'}`,
                        style: { transform:`translate(${olam.achbar.x}px, ${olam.achbar.y}px)` }
                    },
                    methods: { classList: { remove: "invisible" } }
                });
                
                if (inRange) {
                    await olam.htmlAction({ shaym: "approach npc msg", properties: { textContent: niv.name }, methods: { classList: { remove: "hidden" } } });
                } else {
                    await olam.htmlAction({ shaym: "approach npc msg", methods: { classList: { add: "hidden" } } });
                }
            }
        } else {
            if(this.intersected) this.removeIntersected();
        }
    }
};
