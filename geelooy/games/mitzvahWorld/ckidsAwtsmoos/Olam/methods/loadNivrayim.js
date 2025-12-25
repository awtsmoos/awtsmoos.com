
/**
 * B"H
 * the method to load Nivrayim
 * RESTORED & OPTIMIZED: Sequential, Reliable, No Size Pre-calc.
 */

import Utils from '../../utils.js'
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js';

export default class {

    async addObject(type, options) {
        if (!AWTSMOOS[type]) {
            console.error(`B"H - Olam.addObject: Type "${type}" does not exist.`);
            return;
        }

        const nivra = new AWTSMOOS[type](options, this);
        let mesh;

        if (options.golem) {
            mesh = await this.generateThreeJsMesh(options.golem);
            mesh.name = nivra.name;
            nivra.mesh = mesh;
            mesh.nivraAwtsmoos = nivra;
            if(!mesh.userData) mesh.userData = {};
            
            if (options.position) mesh.position.copy(options.position);
            if (options.rotation) mesh.rotation.copy(options.rotation); 
            if (options.scale) mesh.scale.copy(options.scale);
            
            if (options.itemData) {
                mesh.userData.itemData = options.itemData;
            }

            mesh.updateMatrixWorld(true);
            if (mesh.geometry) mesh.geometry.sourceMesh = mesh; 

            let physicsSuccess = true;
            if (options.isSolid) {
                const playerPos = this.chossid ? this.chossid.mesh.position : null;
                physicsSuccess = this.worldOctree.addObject(mesh, playerPos);
                if (!physicsSuccess) {
                    console.error(`B"H Error: Failed to add ${mesh.name} to Physics. Aborting.`);
                    return null; 
                }
            }
            
            if (physicsSuccess) {
                mesh.traverse(child => {
                    if(child.isMesh) {
                        if(!child.userData) child.userData = {};
                        if(options.itemData) child.userData.itemData = options.itemData;
                        if(options.isSolid) child.userData.isSolid = true;
                    }
                });
                
                if (options.interactable && type !== 'CustomNpc' && type !== 'Chossid' && type !== 'Medabeir') {
                    this.interactiveOctree.fromGraphNode(mesh);
                }
                this.nivrayimGroup.add(mesh);
            }
            
        } else if (options.path) {
             let res = await this.boyrayNivra(nivra);
             if (res) {
                 await this.hoyseef(nivra);
             }
        }
        
        this.nivrayim.push(nivra);
        await nivra.ready();
        await nivra.afterBriyah();
        return nivra;
    }

    async loadNivrayim(nivrayim) {
        try {
            console.log("B\"H - loadNivrayim started (Fast Mode)");
            var nivrayimMade = [];
            var ent = Object.entries(nivrayim);
            
            // --- 1. Instantiation Phase ---
            for (var [type, nivraOptions] of ent) {
                var ar = Array.isArray(nivraOptions) ? nivraOptions : Object.entries(nivraOptions);
                
                for (var entry of ar) {
                    var name = null, options = null;
                    if (Array.isArray(nivraOptions)) { options = entry; name = options.name; } 
                    else { name = entry[0]; options = entry[1]; }

                    if (type === "Chossid" && this.playerSettings && this.playerSettings.inventory) {
                        options.inventory = this.playerSettings.inventory;
                    }

                    let nivra;
                    try {
                        const evaledObject = Utils.evalStringifiedFunctions(options);
                        var c = AWTSMOOS[type];
                        if (c && typeof(c) == "function") {
                            nivra = new c({ name, ...evaledObject }, this);
                            if(nivra) nivrayimMade.push(nivra);
                        } else {
                            console.warn(`B"H - Class ${type} not found!`);
                        }
                    } catch (e) {
                        console.error("B\"H - Error instantiating nivra", options, e);
                    }
                }
            }

            // B"H: SKIPPED SIZE CALCULATION (Etching) as requested.
            // We just assume 100% / total entities for the progress bar.
            
            // --- 2. Execution Phases ---
            
            const total = nivrayimMade.length;
            console.log(`B"H - Manifesting ${total} entities...`);

            // Phase A: Heescheel (Loading Assets)
            for (let i = 0; i < total; i++) {
                const nivra = nivrayimMade[i];
                
                // Update UI
                const pct = Math.floor(((i + 1) / total) * 100);
                this.ayshPeula("increase loading percentage", {
                    amount: pct,
                    reset: true, // Jump to absolute percentage
                    action: "Manifesting...",
                    subAction: `${nivra.name || nivra.type}`
                });

                // Yield to UI briefly
                await new Promise(r => setTimeout(r, 0));

                try {
                    if (nivra.heescheel && typeof(nivra.heescheel) === "function") {
                        await nivra.heescheel(this, { nivrayimMade });
                    }
                } catch (e) {
                    console.error(`B"H - Error creating ${nivra.name}:`, e);
                    // Continue! Do not stop the world.
                }
            }

            // Phase B: Structure & Logic
            // These are usually fast, can group them or keep sequential for safety
            for (const nivra of nivrayimMade) {
                try {
                    if (nivra.madeAll) await nivra.madeAll(this);
                    await this.doPlaceholderAndEntityLogic(nivra);
                } catch(e) { console.error("B\"H Logic Error", e); }
            }

            // Phase C: Awakening (Ready)
            this.ayshPeula("increase loading percentage", {
                amount: 100,
                reset: true,
                action: "Awakening...",
                subAction: "Igniting Souls"
            });

            for (const nivra of nivrayimMade) {
                try {
                    if (nivra.ready) await nivra.ready();
                    if (nivra.afterBriyah) await nivra.afterBriyah();
                } catch(e) {
                    console.error(`B"H - Error in ready/afterBriyah for ${nivra.name}`, e);
                }
            }

            this.ayshPeula("updateProgress", {
                loadedNivrayim: Date.now()
            });

            console.log("B\"H - Adding Lights (Ohr)");
            if(!this.enlightened) this.ohr();
                
            return nivrayimMade;

        } catch (error) {
            console.error("B\"H - CRITICAL ERROR in loadNivrayim: ", error);
             this.ayshPeula("increase loading percentage", {
                error: {
                    title: "World Load Failed",
                    message: "A critical error occurred while loading the world.",
                    details: error.message || error.toString()
                }
            });
        }
    }
}
