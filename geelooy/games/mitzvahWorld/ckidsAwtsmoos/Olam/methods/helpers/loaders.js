
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';
import { ITEM_REGISTRY } from '../../../systems/inventory/data/registry.js';

export default {
    async loadGLTF(url) {
        try {
            const gltf = await (new GLTFLoader().loadAsync(url));
            return gltf;
        } catch(e) {
            console.log(e);
            return null;
        }
    },

    loadTexture({ nivra, url, shouldRepeat = false, repeatX = 1, repeatY = 1 }) {
        return new Promise((resolve) => {
            if(!nivra) {
                nivra = this?.nivrayim?.find(q => q?.asset);
            }
            if(!nivra) return resolve({error: "No nivra found"});
            var a = nivra.asset;
            if(!a) return resolve({error: "No asset nivra"});
            var loader = nivra?.asset?.parser?.textureLoader;
            if(!loader) return resolve({error: "No texture loader"});
            
            loader.load(
                url,
                function (imageBitmap) {
                    var texture = new THREE.Texture(imageBitmap);
                    if (shouldRepeat) {
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(repeatX, repeatY);
                    }
                    texture.needsUpdate = true;
                    resolve(texture);
                },
                undefined,
                function (err) {
                    console.warn('B"H: Error loading texture, resolving null to prevent hang:', url, err);
                    resolve(null);
                }
            );
        });
    },
    
    async getIconFromType(type) {
		if(type && typeof(type) == "string") {
			const itemData = ITEM_REGISTRY[type];
			if(itemData && itemData.icon) {
                // If it's a raw SVG string or Data URI, return it
                if(itemData.icon.startsWith("<svg") || itemData.icon.startsWith("data:")) {
                    return itemData.icon;
                }
                // If it's a path to a module (legacy), try to fetch it
                if(itemData.icon.endsWith(".js")) {
                    try {
                        const module = await import(itemData.icon);
                        return module.default;
                    } catch(e) {
                        console.warn("B\"H: Failed to load icon module", e);
                    }
                }
                return itemData.icon;
			}
		}
		return null;
    }
};
