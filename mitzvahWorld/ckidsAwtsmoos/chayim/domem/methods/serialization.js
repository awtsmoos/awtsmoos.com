
/**
 * B"H
 * @file serialization.js
 * Saving state and removing from existence.
 */
import Utils from '../../../utils.js';
import Nivra from "../../nivra.js";

export default {
    getPath() {
        if(this.path && typeof(this.path) == "string") {
            var derech = this.path;
            if (this.path.startsWith('awtsmoos://')) {
                var component = this.olam.getComponent(this.path);
                if (!component) {
                    console.log(`Component "${component}" not found, ${this.path}`);
                    return "";
                }
                derech = component;
                this.loadedPath = derech;
            }
            return derech;
        }
        return null;
    },

    async getSize() {
        var path = this.getPath();
        if(!path) return 0;
        try {
            var r = await fetch(path);
            var lng = r.headers.get("Content-Length")
            return parseInt(lng);
        } catch(e){
            console.log(e)
        }
        return 0;
    },

    sealayk() {
        this.ayshPeula("sealayk");
    },

    serialize() {
        // B"H: Fix for super call in object literal mixin
        Nivra.prototype.serialize.call(this);
        
        this.serialized = {
            ...this.serialized,
        };
        
        var optionKeys = Object.keys(this?.originalOptions || {});
        var original = ["on", "itemData", "dimensions"];

        const hasSmartMetadata = this.itemData || (this.originalOptions && this.originalOptions.itemData);

        for(var key of optionKeys) {
            if (key === "golem" && hasSmartMetadata) {
                continue; 
            }

            var tried = this[key] || this.originalOptions[key];
            
            if(original.includes(key)) {
                this.serialized[key] = this.originalOptions[key] || this[key];
                
                if(key == "on") {
                    tried = Utils.stringifyFunctions(this.serialized[key]);
                    this.serialized[key] = tried;
                }
                continue;
            }
            
            if(typeof(tried?.serialize) == "function") {
                tried = tried?.serialize?.();
            }
            
            this.serialized[key] = tried;
        }

        if (this.itemData) {
            this.serialized.itemData = this.itemData;
        }

        return this.serialized;
    }
};
