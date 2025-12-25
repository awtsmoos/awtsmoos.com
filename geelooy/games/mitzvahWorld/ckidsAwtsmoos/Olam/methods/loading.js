
/** 
 * B"H
 * methods related to inital load
 * Now with Robust Caching and Error Handling!
*/
import AssetCache from "../../utils/AssetCache.js";

export default class {
    /**
     * Load a component and store it in the components property.
     * Checks IndexedDB cache first.
     */
    async loadComponent(shaym, url) {
        if(typeof(url) !== "string") {
            this.components[shaym] = url;
            return shaym;
        }

        let blob = null;
        
        // 1. Try Cache
        try {
            blob = await AssetCache.get(url);
        } catch(e) {
            console.warn(`B"H - Cache check failed for ${shaym}, falling back to network.`);
        }

        // 2. Network Fetch if miss
        if (!blob) {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch "${url}" (Status: ${response.status})`);
            }
            blob = await response.blob();
            
            // 3. Cache for Future
            // We don't await the put to speed up current load, unless we want strict consistency
            // Awaiting is safer to prevent race conditions in IDB if many writes happen
            await AssetCache.put(url, blob);
        }

        // 4. Create Blob URL
        const blobUrl = URL.createObjectURL(blob);
        this.components[shaym] = blobUrl;
        return shaym;
    }

    /**
     * Retrieve a component or sub-component by its name or path.
     */
    getComponent(shaym) {
        if (typeof shaym !== "string") return;

        const resolvePath = (obj, path) => {
            const keys = path.split("/");
            let current = obj;
            for (const key of keys) {
                if (current == null || typeof current !== "object") return undefined;
                current = current[key];
            }
            return current;
        };

        if (shaym.startsWith("awtsmoos://")) {
            const path = shaym.slice(11);
            const baseKey = path.split("/")[0];

            const baseComponent = this.components[baseKey];
            if (!baseComponent) return undefined;

            if (typeof baseComponent === "string") {
                return baseComponent;
            }

            return path.includes("/") ? resolvePath(baseComponent, path.slice(baseKey.length + 1)) : baseComponent;
        }

        if (shaym.startsWith("awtsmoos.vars")) {
            const path = shaym.slice(16);
            const baseKey = path.split("/")[0];

            const baseVar = this.vars[baseKey];
            if (!baseVar) {
                console.warn(`Variable "${baseKey}" not found.`);
                return undefined;
            }

            if (typeof baseVar === "string") {
                return baseVar;
            }

            return path.includes("/") ? resolvePath(baseVar, path.slice(baseKey.length + 1)) : baseVar;
        }

        return undefined;
    }

    $gc(shaym) {
        return this.getComponent(shaym)
    }

    async loadComponents(components) {
        // Initialize Cache Database once at start
        await AssetCache.init();

        var ent = Object.entries(components);
        const total = ent.length;
        let loadedCount = 0;
        
        // B"H: Parallel Load Logic with Individual Error Handling
        const loadPromises = ent.map(async ([shaym, url]) => {
            try {
                await this.loadComponent(shaym, url);
            } catch(e) {
                console.error(`B"H - Failed to load component ${shaym}:`, e);
                // We proceed without this component, but maybe log it to UI
                 this.ayshPeula("increase loading percentage", {
                    amount: 0,
                    error: {
                        title: "Asset Load Warning",
                        message: `Failed to load asset: ${shaym}`,
                        details: e.message
                    }
                });
            } finally {
                loadedCount++;
                // B"H: Vivid Progress Update
                // We update the UI for EVERY file to show "Specific loading".
                // We calculate a global percentage based on file count.
                const percent = (loadedCount / total) * 100;
                
                this.ayshPeula("increase loading percentage", {
                    amount: (100 / total), // Increment by slice
                    reset: true, // Use calculated total instead of additive
                    total: percent,
                    action: "Initializing World Assets...",
                    subAction: `Loaded: ${shaym} (${Math.round(percent)}%)`
                });
            }
        });

        await Promise.all(loadPromises);
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
        if(typeof(href) != "string") return;
        
        // B"H: Modules are code, we import them directly.
        // Caching module code via Blob is complex due to relative imports.
        // We rely on browser cache for JS files.
        
        this.ayshPeula("increase loading percentage", {
            amount: 0,
            action: "Loading Modules...",
            subAction: "Module: " + name
        });
        
        try {
            var ob = await import(href);
            if(ob && typeof(ob) != "object") return;
            if(!ob.default) return;
            return ob.default;
        } catch(e) {
            console.log(e);
            return null;
        }
    }

    setAsset(shaym, data) {
        this.assets[shaym] = data;
    }

    $ga(shaym) {
        return this.getAsset(shaym);
    }

    getAsset(shaym) { 
        return this.assets[shaym] || null;
    }

    setAssets(assets = {}) {
        if(typeof(assets) != "object" || !assets) return;
        Object.keys(assets).forEach(k => {
            this.assets[k] = assets[k]
        });
    }

    // Keep helper for others
    async fetchWithProgress(url, options = {}, otherOptions) {
        // Standard fetch pass-through if needed, but loadComponents uses internal logic now.
        return fetch(url, options);
    }

    constructor() {}
}
