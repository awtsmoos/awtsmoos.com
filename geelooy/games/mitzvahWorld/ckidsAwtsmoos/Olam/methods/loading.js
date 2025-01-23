/** 
 * B"H
 * methods related to inital load
*/

export default class {
    /**
     * Load a component and store it in the components property.
     * Components are raw data loaded from a server
     * or stored as static assets directly.
     * @param {String} shaym - The name of the component.
     * @param {String} url - The URL of the component's model.
     */
    async loadComponent(shaym, url) {
        if(typeof(url) == "string") {
            var self = this;
            // Fetch the model data
            var response = await this.fetchWithProgress(url, null, {
                async onProgress(p) {
                    var size = self.componentSizes[shaym];
                    var ttl = self.totalComponentSize;

                    if(!size) return;

                    var myPercent = size / ttl;

                    await self.ayshPeula("increase loading percentage", {
                        amount: 100 * p * myPercent,
                        action: "Loading component: "+ shaym + ". ",
                       // subAction: (myPercent * 100).toFixed(2) + "%"
                    })

                   
                }
            });

            // Check if the fetch was successful
            if (!response.ok) {
                throw new Error(`Failed to fetch the model from "${url}"`);
            }

            // Get the model data as a Blob
            var blob = await response.blob();

            // Create a URL for the Blob
            var blobUrl = URL.createObjectURL(blob);

            // Store the blob URL in the components property
            this.components[shaym] = blobUrl;
            return shaym;
        }

        if(typeof(url) == "object" && url) {
            this.components[shaym] = url;
            return shaym;
        }

        if(typeof(url) == "function") {
            var res = await url(this);
            this.components[shaym] = res;
            return shaym;
        }

        return shaym;
        
    }

    /**
     * Retrieve a component or sub-component by its name or path.
     * Supports "awtsmoos://" for components and "awtsmoos.vars" for variables.
     * Handles nested paths for objects.
     * @param {String} shaym - The component path (e.g., "awtsmoos://awtsmoosModels/brick").
     * @returns {Object|String|undefined} - The resolved component, sub-component, or undefined.
     */
    getComponent(shaym) {
        if (typeof shaym !== "string") return;

        const resolvePath = (obj, path) => {
            // Traverse the object using the path
            const keys = path.split("/");
            let current = obj;
            for (const key of keys) {
                if (current == null || typeof current !== "object") return undefined; // Stop if path is invalid
                current = current[key];
            }
            return current;
        };

        if (shaym.startsWith("awtsmoos://")) {
            const path = shaym.slice(11);
            const baseKey = path.split("/")[0];

            // Ensure the base component is loaded
            const baseComponent = this.components[baseKey];
            if (!baseComponent) {
                console.warn(`Component "${baseKey}" not found.`);
                return undefined;
            }

            // If the base component is a string (e.g., a URL or data), return it as-is
            if (typeof baseComponent === "string") {
                return baseComponent;
            }

            // If it's an object, resolve the sub-path
            return path.includes("/") ? resolvePath(baseComponent, path.slice(baseKey.length + 1)) : baseComponent;
        }

        if (shaym.startsWith("awtsmoos.vars")) {
            const path = shaym.slice(16);
            const baseKey = path.split("/")[0];

            // Ensure the variable is defined
            const baseVar = this.vars[baseKey];
            if (!baseVar) {
                console.warn(`Variable "${baseKey}" not found.`);
                return undefined;
            }

            // If the base variable is a string, return it as-is
            if (typeof baseVar === "string") {
                return baseVar;
            }

            // If it's an object, resolve the sub-path
            return path.includes("/") ? resolvePath(baseVar, path.slice(baseKey.length + 1)) : baseVar;
        }

        return undefined; // If no valid prefix, return undefined
    }

    $gc(shaym) {
        return this.getComponent(shaym)
    }

    async loadComponents(components) {
        /**
         * first, get total components size
         * fetchGetSize
         */
        var ent = Object.entries(components);
        var sizes = {}
        var componentSize = 0;
        for(var [shaym, url] of ent) {
            var size = await this.fetchGetSize(url)
            sizes[shaym] = size
            componentSize += size;
        }
        this.totalComponentSize = componentSize;
        this.componentSizes = sizes;
        //console.log("COMP SIZES",sizes)
        for (var [shaym, url] of ent) {
            await this.loadComponent(shaym, url);
        }
    }

    modules = {};
    async getModules(modules={}) {
        if(typeof(modules) != "object" || !modules) {
            return;
        }

        var getModulesInValue = async modules => {
            var ks = Object.keys(modules);
            var modulesAdded = {};
            for(var key of ks) {
                
                var v = modules[key];
                if(typeof(v) == "object") {
                    var subModules = await getModulesInValue(v);
                    modulesAdded[key] = subModules;
                   
                } else if(typeof(v) == "string") {
                    var mod = await this.getModule(v, {others:ks,name:key});
                    modulesAdded[key] = mod;
                    
                }
            }
            return modulesAdded;
        };

        var mods = await getModulesInValue(modules);
        if(mods) {
            this.modules = {
                ...this.modules,
                ...mods
            }
        }
        return mods;



        
    }

    async getModule(href, {others, name}) {
        if(
            typeof(href) != "string"
        ) return;
        var perc = 1 / others.length;
        var ob  = null;
        this.ayshPeula("increase loading percentage", {
            amount: perc * 100,
            action: "Loading Modules...",
            subAction: "Module: " + name
        });
        try {
            ob = await import(href);
            if(ob && typeof(ob) != "object") {
                return
            }
            if(!ob.default) {
                return
            }
            return ob.default;
        } catch(e) {
            console.log(e);
            return null;
        }


        

        
    }


    /**
     * @method setAsset simply
     * loads in the instantiated
     * JS object (or other raw data)
     * into the world's assets for later use
     * and local caching. Does not include
     * remote resources. For remote -  see
     * components.
     * @param {String} shaym 
     * @param {*} data 
     */
    setAsset(shaym, data) {
        this.assets[shaym] = data;
    }

    /**
     * @method $ga short for 
     * getAsset.
     * @param {String} shaym 
     */
    $ga(shaym) {
        return this.getAsset(shaym);
    }

    getAsset(shaym) {
        return this.assets[shaym] || null;
    }

    setAssets(assets = {}) {
        if(
            typeof(assets) != "object" ||
            !assets
        ) {
            return;
        }
        Object.keys(assets)
        .forEach(k => {
            this.assets[k] =
            assets[k]
        });
    }

    constructor()  {
        
    }
}