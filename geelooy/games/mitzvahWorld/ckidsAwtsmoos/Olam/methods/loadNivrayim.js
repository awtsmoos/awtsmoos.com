
/**
 * B"H
 * the method to load Nivrayim (Legacy Entry Gateway)
 */

import Utils from '../../utils.js'
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js';

export default class {

	async addObject(type, options) {
        // B"H: silent

        if (!AWTSMOOS[type]) {
            console.error(`B"H - Olam.addObject: Type "${type}" does not exist.`);
            return;
        }

        const nivra = new AWTSMOOS[type](options, this);
        let mesh;

        if (options.golem) {
            mesh = await this.generateThreeJsMesh(options.golem, this);
            mesh.name = nivra.name;
            nivra.mesh = mesh;
            mesh.nivraAwtsmoos = nivra;
		    if(!mesh.userData) mesh.userData = {};
            
            if (options.position) mesh.position.copy(options.position);
            if (options.rotation) {
                 const r = options.rotation;
                 if(typeof r.x === 'number') mesh.rotation.set(r.x, r.y, r.z);
            }
            if (options.scale) mesh.scale.copy(options.scale);
            
            if (options.itemData) {
                mesh.userData.itemData = options.itemData;
            }

            mesh.updateMatrixWorld(true);

            let physicsSuccess = true;
            if (options.isSolid) {
                physicsSuccess = this.worldOctree.addObject(mesh);
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
                        child.nivraAwtsmoos = nivra;
                    }
                });
                
                if (options.interactable && type !== 'CustomNpc' && type !== 'Chossid' && type !== 'Medabeir') {
                    this.interactiveOctree.fromGraphNode(mesh);
                }
                this.nivrayimGroup.add(mesh);
            }
            
        }
        
        this.nivrayim.push(nivra);
        // B"H: silent

        await nivra.ready();
        // B"H: silent

        await nivra.afterBriyah();
        // B"H: silent

        return nivra;
    }

    async loadNivrayim(nivrayim) {
        try {
            const worldSize = Object.keys(nivrayim || {}).length;
            // B"H: silent

            var nivrayimMade = [];
            var ent = Object.entries(nivrayim || {});
            
            for (var [type, nivraOptions] of ent) {
                // B"H: silent

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

                    let nivra;
                    var evaledObject = null;

                    try {
                        evaledObject = Utils.evalStringifiedFunctions(options);
                        var c = AWTSMOOS[type];
                        if (c && typeof(c) == "function") {
                            nivra = new c({
                                name,
                                ...evaledObject
                            }, this);
                        }
                    } catch (e) {
                        console.error("B\"H - Error instantiating legacy nivra", options, e);
                    }

                    if (!nivra) continue;
                    nivrayimMade.push(nivra);
                }
            }

            var totalSize = 0;
            for(var nivra of nivrayimMade) {
                nivra.olam = this;
                var s = 0;
                if (typeof nivra.getSize === 'function') {
                    s = await nivra.getSize();
                }
                totalSize += s;
                nivra.size = s;
            }
            this.totalSize = totalSize;

            for (var nivra of nivrayimMade) {
                if (typeof nivra.heescheel === "function") {
                    try {
                        await nivra.heescheel(this, { nivrayimMade });
                    } catch(e) {
                        console.error(`B"H - legacy heescheel failure: ${nivra.name}`, e);
                    }
                }
            }
            
            for (var nivra of nivrayimMade) {
                if (nivra.madeAll) await nivra.madeAll(this);
            }
            
            for (var nivra of nivrayimMade) {
                await this.doPlaceholderAndEntityLogic(nivra);
            }

            for (var nivra of nivrayimMade) {
                if (nivra.ready) await nivra.ready();
            }

			for(var nivra of nivrayimMade) {
				if(nivra.afterBriyah) await nivra.afterBriyah();
			}

            if(!this.enlightened && typeof this.ohr === 'function') {
                this.ohr();
            }
                
            return nivrayimMade || [];
        } catch (error) {
            console.error("B\"H - LEGACY LOAD FAILED: ", error);
            return [];
        }
    }
}
