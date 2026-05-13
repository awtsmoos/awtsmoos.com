// B"H
/**
 * @file textures.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE GARMENTS OF THE DWELLING — Material Factory           ║
 * ║                                                             ║
 * ║  "Blue and purple and scarlet yarn and fine linen..."      ║
 * ║  (Shemos 25:4)                                              ║
 * ║                                                             ║
 * ║  Loads and applies the sacred textures to the architecture.║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default {
    /**
     * @method loadBuildingMaterials
     * @description Fetches textures and returns a standard material array.
     */
    async loadBuildingMaterials(olam) {
        const load = async (url, repeat = 2) => {
            if (!olam || typeof olam.loadTexture !== 'function') return null;
            return await olam.loadTexture({ 
                url, 
                shouldRepeat: true, 
                repeatX: repeat, 
                repeatY: repeat 
            }).catch(() => null);
        };

        const tStone = await load('awtsmoostex://stone', 2);
        const tWood  = await load('awtsmoostex://wood', 2);
        const tBrick = await load('awtsmoostex://brick', 1);
        const tFloor = await load('awtsmoostex://sand', 2);

        const wallTexArray = [tBrick, tStone, tWood];
        const randomWallTex = wallTexArray[Math.floor(Math.random() * wallTexArray.length)];

        const make = (color, map, roughness = 0.85) => new THREE.MeshLambertMaterial({
            color,
            map: map || null,
            side: THREE.DoubleSide
        });

        return [
            make(0xcaa978, randomWallTex), // Walls
            make(0x8a5a32, tWood),         // Beams
            make(0xb5b2a7, tStone),        // Stone
            make(0xc7a76a, tFloor),        // Floor
        ];
    }
};
