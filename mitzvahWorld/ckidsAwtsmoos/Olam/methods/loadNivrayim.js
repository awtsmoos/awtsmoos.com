
/**
 * B"H
 * the method to load Nivrayim
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
            console.error(`B"H - addObject requires 'golem' for dynamic objects currently.`);
            return;
        }
        
        this.nivrayim.push(nivra);
        await nivra.ready();
        await nivra.afterBriyah();
        return nivra;
    }

    async loadNivrayim(nivrayim) {
        try {
            console.log("B\"H - loadNivrayim started");
            var nivrayimMade = [];
            var ent = Object.entries(nivrayim);
            
            for (var [type, nivraOptions] of ent) {
                var ar;
                var isAr = false;
                if (Array.isArray(nivraOptions)) {
                    ar = nivraOptions;
                    isAr = true;
                } else {
                    ar = Object.entries(nivraOptions);
                }

                for (var entry of ar) {
                    var name = null;
                    var options = null;
                    if (isAr) {
                        options = entry;
                        name = options.name;
                    } else {
                        name = entry[0];
                        options = entry[1];
                    }

                    if (type === "Chossid" && this.playerSettings && this.playerSettings.inventory) {
                        options.inventory = this.playerSettings.inventory;
                    }

                    let nivra;
                    var evaledObject = null;

                    try {
                        evaledObject = Utils.evalStringifiedFunctions(options);
                        var c = AWTSMOOS[type];
                        if (c && typeof(c) == "function") {
                            // console.log(`B"H - Instantiating ${type}: ${name}`);
                            nivra = new c({
                                name,
                                ...evaledObject
                            }, this);
                        } else {
                            console.warn(`B"H - Class ${type} not found!`);
                        }
                    } catch (e) {
                        console.error("B\"H - Error instantiating nivra", options, e);
                    }

                    if (!nivra) continue;

                    nivrayimMade.push(nivra);
                    
                    this.ayshPeula(
                        "increase loading percentage", {
                            amount: (100) / (nivrayimMade.length),
                            nivra,
                            action: "initting " + name
                        }
                    );
                }
            }

            var sizes = [];
            var totalSize = 0;
            for(var nivra of nivrayimMade) {
                nivra.olam = this;
                var s = await nivra.getSize();
                sizes.push({
                    nivra,
                    size:s
                })
                totalSize += s;
                nivra.size = s;
            }
            this.totalSize = totalSize;

            console.log("B\"H - Initialization Phase (heescheel) starting for " + nivrayimMade.length + " entities.");
            
            for (var nivra of nivrayimMade) {
                if (nivra.heescheel && typeof(nivra.heescheel) === "function") {
                    try {
                        console.log(`B"H - heescheel: ${nivra.name} (${nivra.type})`);
                        await nivra.heescheel(this, {
                            nivrayimMade
                        });
                        console.log(`B"H - heescheel done: ${nivra.name}`);
                    } catch(e) {
                        console.error(`B"H - problem loading nivra ${nivra.name}`, e);
                    }
                    this.ayshPeula("increase loading percentage", {
                        amount:(100) / (nivrayimMade.length),
                        nivra,
                        action: "Setting up " + nivra.name,
                        info: { nivra }
                    });
                }
            }
            
            console.log("B\"H - madeAll Phase");
            
            for (var nivra of nivrayimMade) {
                if (nivra.madeAll) {
                    await nivra.madeAll(this);
                }
            }
            
            console.log("B\"H - Placeholder/Entity Logic Phase");
            
            for (var nivra of nivrayimMade) {
                await this.doPlaceholderAndEntityLogic(nivra);
            }

            console.log("B\"H - Ready Phase");

            for (var nivra of nivrayimMade) {
                if (nivra.ready) {
                    await nivra.ready();
                }
            }

            console.log("B\"H - AfterBriyah Phase");
            
			for(var nivra of nivrayimMade) {
				if(nivra.afterBriyah) {
					await nivra.afterBriyah();
				}
			}

            this.ayshPeula("updateProgress",{
                loadedNivrayim: Date.now()
            })

            console.log("B\"H - Adding Lights (Ohr)");
            
            if(!this.enlightened)
                this.ohr();
                
            return nivrayimMade;
        } catch (error) {
            console.error("B\"H - CRITICAL ERROR in loadNivrayim: ", error);
        }
    }
}
