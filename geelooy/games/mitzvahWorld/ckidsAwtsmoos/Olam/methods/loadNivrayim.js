
/**
 * B"H
 * the method to load Nivrayim
 * Using ClassMap registry to prevent circular dependencies.
 */

import Utils from '../../utils.js'
import ClassMap from '../../registry/classMap.js';

export default class {

    async addObject(type, options) {
        
        const path = ClassMap[type];
        if (!path) {
            console.error(`B"H - Olam.addObject: Type "${type}" is not registered in ClassMap.`);
            return;
        }

        let Module;
        try {
            Module = await import(path);
        } catch(e) {
            console.error(`B"H [addObject] CRITICAL IMPORT ERROR: Failed to load module for ${type} at ${path}`, e);
            return;
        }

        if (!Module || !Module.default) {
            console.error(`B"H - Olam.addObject: Module for "${type}" does not export default.`);
            return;
        }

        const EntityClass = Module.default;
        const nivra = new EntityClass(options, this);
        
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
        console.log("B\"H [loadNivrayim] STARTING via ClassMap.");
        
        try {
            var nivrayimMade = [];
            var ent = Object.entries(nivrayim);
            
            // --- 1. Instantiation Phase ---
            for (var [type, nivraOptions] of ent) {
                
                const path = ClassMap[type];
                if(!path) {
                    console.warn(`B"H [loadNivrayim] Class ${type} not found in Registry! Skipping.`);
                    continue;
                }

                let Module;
                try {
                    Module = await import(path);
                } catch(e) {
                    console.error(`B"H [loadNivrayim] Failed to import ${type} from ${path}`, e);
                    continue;
                }
                
                const EntityClass = Module.default;

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
                        if (EntityClass) {
                            nivra = new EntityClass({ name, ...evaledObject }, this);
                            if(nivra) nivrayimMade.push(nivra);
                        }
                    } catch (e) {
                        console.error(`B"H [loadNivrayim] Error instantiating ${type} (${name})`, options, e);
                    }
                }
            }

            // --- 2. Execution Phases ---
            const total = nivrayimMade.length;
            console.log(`B"H - Manifesting ${total} entities...`);

            // Phase A: Heescheel (Loading Assets)
            for (let i = 0; i < total; i++) {
                const nivra = nivrayimMade[i];
                
                const pct = Math.floor(((i + 1) / total) * 100);
                this.ayshPeula("increase loading percentage", {
                    amount: pct,
                    reset: true, 
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
                }
            }

            // Phase B: Structure & Logic
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
