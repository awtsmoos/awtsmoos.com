
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

        // B"H: Track source URL for cache invalidation logic
        // This is crucial: 'shaym' is the key (e.g., 'world'), 'url' is the http source.
        if(!this.componentSourceUrls) this.componentSourceUrls = {};
        this.componentSourceUrls[shaym] = url;

        let blob = null;
        
        // 1. Try Cache
        try {
            blob = await AssetCache.get(url);
        } catch(e) {
            console.warn(`B"H - Cache check failed for ${shaym}, falling back to network.`);
        }

        // 2. Network Fetch if miss
        if (!blob) {
            console.log(`B"H - Fetching ${shaym} from ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch "${url}" (Status: ${response.status})`);
            }
            blob = await response.blob();
            
            // 3. Cache for Future
            await AssetCache.put(url, blob);
        } else {
            console.log(`B"H - Loaded ${shaym} from Cache`);
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
        
        console.log(`B"H - Starting load of ${total} components.`);

        // B"H: Parallel Load Logic with Individual Error Handling
        const loadPromises = ent.map(async ([shaym, url]) => {
             // B"H: Notify Start of individual load
             this.ayshPeula("increase loading percentage", {
                amount: 0,
                action: "Initializing World Assets...",
                subAction: `Fetching: ${shaym}`
            });
            
            try {
                await this.loadComponent(shaym, url);
            } catch(e) {
                console.error(`B"H - Failed to load component ${shaym}:`, e);
                // We proceed without this component, but log it to UI
                 this.ayshPeula("increase loading percentage", {
                    amount: 0,
                    error: {
                        title: "Asset Load Warning",
                        message: `Failed to load asset: ${shaym}`,
                        details: `${e.message}\nURL: ${url}`
                    }
                });
            } finally {
                loadedCount++;
                // B"H: Vivid Progress Update
                const percent = (loadedCount / total) * 100;
                
                this.ayshPeula("increase loading percentage", {
                    amount: (100 / total), 
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
        
        console.log(`B"H - Loading Module: ${name} from ${href}`);
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
            console.error(`B"H - Failed to load module ${name}:`, e);
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
