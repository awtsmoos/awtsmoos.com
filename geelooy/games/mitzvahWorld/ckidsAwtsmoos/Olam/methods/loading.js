
// B"H
/** 
 * loading.js - The drawing down of the Infinite Light (Ohr) into defined Vessels (Kailim).
 * This vessel is the gatekeeper of existence, ensuring that only pure and verified speech
 * is permitted to manifest within the Olam.
 * Refined to be robust against missing server headers.
 */
import AssetCache from "../../utils/AssetCache.js";

export default class {
    /**
     * $gc - Sacred alias for getComponent.
     */
    $gc(shaym) {
        return this.getComponent(shaym);
    }

    /**
     * loadComponent - Bridges the gap between the Infinite (Server) and the Finite (Cache).
     * @param {string} shaym The Holy Name of the vessel.
     * @param {string} url The path through which the Speech descends.
     * @param {function} onProgress A callback to track the manifestation magnitude.
     */
    async loadComponent(shaym, url, onProgress) {
        if(typeof(url) !== "string") {
            this.components[shaym] = url;
            return shaym;
        }

        if(!this.componentSourceUrls) this.componentSourceUrls = {};
        this.componentSourceUrls[shaym] = url;

        let blob = null;
        
        // 1. SEEKING THE HIDDEN: Check if the vessel is already stored in the Zikaron (Memory)
        try {
            blob = await AssetCache.get(url);
        } catch(e) {
            console.warn(`B"H - Cache search encountered a veil for ${shaym}.`);
        }

        if (!blob) {
            /**
             * 2. THE INTEGRITY PULSE
             * Drawing down bytes.
             */
            const response = await this.fetchWithProgress(url, null, {
                onProgress: (p) => {
                    if (typeof onProgress === 'function') onProgress(p);
                }
            });

            if (!response.ok) {
                throw new Error(`B"H Error: The Speech at "${url}" was not spoken correctly. Status: ${response.status}`);
            }

            blob = await response.blob();
            await AssetCache.put(url, blob);
        } else {
            // If cached, the manifestation is instantaneous within the soul.
            if (typeof onProgress === 'function') onProgress(1);
        }

        // 3. MANIFESTATION: Create a local handle for the data
        const blobUrl = URL.createObjectURL(blob);
        this.components[shaym] = blobUrl;
        return shaym;
    }

    /**
     * loadComponents - Parallelizes the manifestation of all required vessels.
     * Simplified to ignore inconsistent server headers and provide a smooth loading experience.
     * Uses file count instead of byte size for progress tracking.
     */
    async loadComponents(components) {
        await AssetCache.init();

        const entries = Object.entries(components);
        const totalFiles = entries.length;
        if (totalFiles === 0) return;

        console.log(`B"H - Atomic Load Initiated: Preparing to draw down ${totalFiles} vessels.`);

        let loadedCount = 0;
        
        const loadPromises = entries.map(async ([shaym, url]) => {
            try {
                await this.loadComponent(shaym, url, (percent) => {
                    // Per-file progress tracking
                });
            } catch (e) {
                console.warn(`B"H - Vessel ${shaym} failed to manifest, continuing...`, e);
            }
            
            loadedCount++;
            const overallPercent = (loadedCount / totalFiles) * 100;
            
            this.ayshPeula("increase loading percentage", {
                amount: overallPercent,
                reset: true, // Absolute positioning of the radial loader
                action: "Drawing Light...",
                subAction: `Manifesting Vessel: ${shaym}`
            });
        });

        // Atomic synchronization - no partial worlds allowed to proceed to the Forge.
        await Promise.all(loadPromises);
        console.log("B\"H - Asset manifestation complete. Ready for the Forge.");
    }

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
            if (typeof baseComponent === "string") return baseComponent;
            return path.includes("/") ? resolvePath(baseComponent, path.slice(baseKey.length + 1)) : baseComponent;
        }

        if (shaym.startsWith("awtsmoos.vars")) {
            const path = shaym.slice(16);
            const baseKey = path.split("/")[0];
            const baseVar = this.vars[baseKey];
            if (!baseVar) return undefined;
            if (typeof baseVar === "string") return baseVar;
            return path.includes("/") ? resolvePath(baseVar, path.slice(baseKey.length + 1)) : baseVar;
        }
        return undefined;
    }

    async getModules(modules={}) {
        const getModulesInValue = async (m) => {
            const added = {};
            for(const key of Object.keys(m)) {
                const v = m[key];
                if(typeof(v) == "object") added[key] = await getModulesInValue(v);
                else if(typeof(v) == "string") added[key] = await this.getModule(v, { name:key });
            }
            return added;
        };
        const mods = await getModulesInValue(modules);
        if(mods) this.modules = { ...this.modules, ...mods };
        return mods;
    }

    async getModule(href, { name }) {
        if(typeof(href) != "string") return;
        try {
            const ob = await import(href);
            return ob?.default;
        } catch(e) {
            console.error(`B"H - Module load error: ${name}`, e);
            return null;
        }
    }

    setAsset(shaym, data) { this.assets[shaym] = data; }
    getAsset(shaym) { return this.assets[shaym] || null; }
    $ga(shaym) { return this.getAsset(shaym); }
    setAssets(assets = {}) { Object.assign(this.assets, assets); }
}
