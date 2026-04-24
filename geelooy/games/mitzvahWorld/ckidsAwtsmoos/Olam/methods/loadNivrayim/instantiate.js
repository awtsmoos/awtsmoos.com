
// B"H
import Utils from '../../../utils.js'
import * as AWTSMOOS from '../../../awtsmoosCkidsGames.js';

export default {
    async addObject(type, options) {
        if (!AWTSMOOS[type]) {
            console.error(`B"H - ⚡ INTENSE ERROR: Olam.addObject Type "${type}" does not exist in registry.`);
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
                    console.error(`B"H - ⚡ INTENSE ERROR: Failed to add ${mesh.name} to Physics. Aborting.`);
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
            console.error(`B"H - ⚡ INTENSE ERROR: addObject requires 'golem' for dynamic objects currently. Ignoring path ${options.path}`);
            return;
        }
        
        this.nivrayim.push(nivra);
        await nivra.ready();
        await nivra.afterBriyah();
        return nivra;
    },

    parseDefinitions(nivrayim) {
        console.log("B\"H - ⚡ INTENSE LOG: parseDefinitions received:", nivrayim);
        var nivrayimMade = [];
        
        if(!nivrayim) {
             console.warn("B\"H - ⚡ INTENSE WARNING: No definitions provided to parseDefinitions!");
             return nivrayimMade;
        }
        
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

            console.log(`B"H - ⚡ INTENSE LOG: Parsing Type Group: [${type}] with ${ar.length} entities.`);

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
                        console.log(`B"H - ⚡ INTENSE LOG: Instantiating entity '${name}' of class '${type}'.`);
                        nivra = new c({ name, ...evaledObject }, this);
                    } else {
                        console.warn(`B"H - ⚡ INTENSE WARNING: Class ${type} not found in AWTSMOOS registry! Entity '${name}' failed.`);
                    }
                } catch (e) {
                    console.error(`B"H - ⚡ INTENSE ERROR: Failed instantiating nivra '${name}' of type '${type}'`, options, e);
                }

                if (!nivra) continue;
                nivrayimMade.push(nivra);
                
                this.ayshPeula("increase loading percentage", {
                    amount: (100) / (nivrayimMade.length || 1), // Avoid div by 0
                    nivra, action: "initting " + name
                });
            }
        }
        
        console.log(`B"H - ⚡ INTENSE LOG: parseDefinitions completed. Generated ${nivrayimMade.length} raw instances.`);
        return nivrayimMade;
    }
};
