/**
 * B"H
 * the method to load Nivrayim
 */

import Utils from '../../utils.js'
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js';
export default class {


	async addObject(type, options) {
        if (!AWTSMOOS[type]) {
            console.error(`Olam.addObject: Type "${type}" does not exist.`);
            return;
        }

        // 1. Create the logical object (Nivra)
        const nivra = new AWTSMOOS[type](options, this);
        let mesh;

        // 2. Create the visual object (Mesh)
        if (options.golem) {
            mesh = await this.generateThreeJsMesh(options.golem);
            mesh.name = nivra.name;
            nivra.mesh = mesh;
            mesh.nivraAwtsmoos = nivra;

            // 3. APPLY TRANSFORMATIONS DIRECTLY - This is the most critical step.
            if (options.position) mesh.position.copy(options.position);
            if (options.rotation) mesh.rotation.copy(options.rotation); // It takes the Euler directly.
            if (options.scale) mesh.scale.copy(options.scale);

            // 4. Update the world matrix BEFORE passing to physics.
            mesh.updateMatrixWorld(true);

            // 5. Add to physics and scene.
            if (options.isSolid) {
                this.worldOctree.addObject(mesh);
            }
            if (options.interactable) {
                this.interactiveOctree.fromGraphNode(mesh);
            }
            this.nivrayimGroup.add(mesh);
            
        } else if (options.path) {
            // Logic for adding GLBs dynamically at runtime can be added here in the future.
            // For now, this ensures your brick-placing is fixed.
            console.error("Dynamic GLB adding not fully implemented in this path yet. Use primitives with 'golem'.");
            return;
        } else {
             console.error("addObject requires either a 'golem' or a 'path'.");
             return;
        }
        
        // 6. Finalize the object.
        this.nivrayim.push(nivra);
        await nivra.ready();
        await nivra.afterBriyah();
        return nivra;
    }

    async loadNivrayim(nivrayim) {
        
        /**
         * for loading stage:
         * 
         * 2 stages:
         * load Nivrayim, goes up to 100% but has 4 parts.
         * 
         * first initiate each nivra,
         * 1/5th of the 100% total
         * 
         * (each section divided by the number of 
         * nivrayim.)
         * 
         * then 2) heescheel (boyrayNivra) of each,
         * 3) madeAll 
         * 4) ready
         * 5) doPlaceholderLogic to get to 100%
         */
        
        try {
            var nivrayimMade = [];
            var ent = Object.entries(nivrayim)
            for (var [type, nivraOptions] of ent) {
                var ar;
                var isAr = false;
                if(Array.isArray(nivraOptions)) {
                    ar = nivraOptions;
                    isAr = true;
                } else {
                    ar = Object.entries(nivraOptions)
                }
                for (var entry of ar) {
                    var name = null;
                    var options = null;
                    if(isAr) {
                        options = entry;
                        name = options.name;
                    } else {
                        name = entry[0];
                        options = entry[1];
                    }
                    let nivra;

                    var evaledObject = null;
                    
                    try {
                       // console.log("Trying to eval",options,name, nivrayim)
                        evaledObject = Utils.evalStringifiedFunctions(
                            options,
                         //   {window:this.window}
                        ); /*
                            when sending fucntions via worker 
                            etc. have to be stringified with special
                            string in front so here it checks
                            for that string and returns object
                            with evaled functions, see source for details.
                        */
                        var c = AWTSMOOS[type];
                        if(c && typeof(c) == "function") {
                            nivra = new c({name, ...evaledObject}, this);
                        }
                    } catch(e) {
                        console.log(
                            "Error handling stringified function",
                            options,
                            e,nivra
                        );
                    }
                    
                    if(!nivra) return null;
                    
                    nivrayimMade.push(nivra);
                    /**
                     * for all nivrayim total this
                     * should add up to 1/5th of the total
                     * loading, so need to 
                     * add 1/5th of 100 divided by 
                     * the number of nivrayim for
                     * each nivra to give accurate
                     * percentage loading.
                     */
                    this.ayshPeula(
                        "increase loading percentage", 
                        {
                            amount:(100) / (
                                nivrayimMade.length
                            ),
                            nivra,
                            
                            action: "initting each nivra"
                        }
                    );


                    
                }
            }

            /**
             * first get size of
             * each nivra model to know
             * how much to incraese percentage in loading...
             */

            var sizes = []/*Array.from({
                length: nivrayimMade.length
            })*/
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

            
            await this.ayshPeula("alert", "Loaded Nivra models, now initing")
            
            // Processing heescheel function sequentially for each nivra
            for (var nivra of nivrayimMade) {
                if (nivra.heescheel && typeof(nivra.heescheel) === "function") {
                    try {
                        
                        await nivra.heescheel(this, {
                            nivrayimMade
                        });
                        
                    } catch(e) {
                        console.log(
                            "problem laoding nivra",
                            nivra,
                            e
                        );
                    }
                    
                    /**
                     * Since this is also
                     * 1/5th of the total
                     * percentage add that divided
                     * by the current number of nivrayim
                     * for each nivra.
                     */
                    this.ayshPeula(
                        "increase loading percentage", 
                        {
                            amount:(100) / (
                                nivrayimMade.length
                            ),
                            nivra,
                            
                            action: "Setting up Nivra " + nivra.name + " in world...",
                            info: {
                                nivra
                            }
                        }
                    );
                }
            }
            
            
            await this.ayshPeula("alert", "Made nivrayim")
            // Processing madeAll and ready function sequentially for each nivra
            for (var nivra of nivrayimMade) {
                if (nivra.madeAll) {
                    await nivra.madeAll(this);
                    /**
                     * Even if the time for each 
                     * function might be different,
                     * still.
                     */
                    this.ayshPeula(
                        "increase loading percentage", 
                        {
                            amount:(100) / (
                                nivrayimMade.length
                            ),
                            nivra,
                            action: "Sending initial messages to nivra "+nivra.name
                        }
                    );
                }
                
                
            }
            
            
            await this.ayshPeula("alert", "placing nivrayim")
			// Processing doPlaceholderLogic function sequentially for each nivra
            for (var nivra of nivrayimMade) {
                await this.doPlaceholderAndEntityLogic(nivra);
                
                this.ayshPeula(
                    "increase loading percentage", 
                    {
                        amount:(100) / (
                            nivrayimMade.length
                        ),
                        nivra,
                        action: "Setting up object placeholders for "+nivra.name
                    }
                );
            }

            
            for (var nivra of nivrayimMade) {
                if (nivra.ready) {
                    
                    await nivra.ready();
                    /**
                     * ibid
                     */
                    this.ayshPeula(
                        "increase loading percentage", 
                        {
                            amount:(100) / (
                                nivrayimMade.length
                            ),
                            nivra,
                            action: "Calling ready state for nivra "+nivra.name
                        }
                    );
                }
            }

            
            await this.ayshPeula("alert", "doing things after nivrayim made")
            
			for(var nivra of nivrayimMade) {
				if(nivra.afterBriyah) {
					await nivra.afterBriyah();
				}
			}

            this.ayshPeula("updateProgress",{
                     
                loadedNivrayim: Date.now()
            })

            

			
			
			
  

            
            await this.ayshPeula("alert", "adding light")
            
            if(!this.enlightened)
                this.ohr();
            return nivrayimMade;
        } catch (error) {
            console.error("An error occurred while loading: ", error);

        }
    }
}