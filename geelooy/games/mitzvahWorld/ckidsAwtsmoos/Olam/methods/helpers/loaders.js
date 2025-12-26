
// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { GLTFLoader } from '/games/scripts/jsm/loaders/GLTFLoader.js';

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
        var icon;
        // Dynamic import to avoid circular dependency issues at the root level
        const AWTSMOOS = await import('../../../awtsmoosCkidsGames.js');
        
		if(type && typeof(type) == "string") {
			var collectableItem = AWTSMOOS[type];
			if(collectableItem) {
				var ty = collectableItem.iconId;
				if(ty) {
					icon = ty;
				}
			}
		}
		var iconData = null;
		if(typeof(icon) == "string") {
			try {
				var iconic = await import("../../../icons/items/"+ icon+".js")
				if(iconic && iconic.default) {
					iconData = iconic.default
				}
			} catch(e){
				return null;
			}
		}
		return iconData
    }
};
