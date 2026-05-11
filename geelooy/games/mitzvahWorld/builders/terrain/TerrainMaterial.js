
/**
 * @file TerrainMaterial.js
 * @description
 * 🌿 CHAPTER 1: THE WEAVING OF THE FIELD 🌿
 */

import MaterialManager from '../../../../chayim/math/MaterialManager.js';
import { ARCHITECTURAL_SHADERS } from '../../../../utils/3d/procedural/Shaders/SederHishtalshelusShaders.js';

export default class TerrainMaterial {
    static weave(color) {
        console.log("B\"H - 🌿 [TerrainMaterial] Extracting Grass Logic...");
        const grass = ARCHITECTURAL_SHADERS.AwtsmoosGrassMaterial;
        
        return MaterialManager.create('Standard', {
            color: color,
            roughness: 1.0,
            metalness: 0.0
        }, {
            vertex: { head: '', main: '' },
            fragment: {
                head: grass.header,
                color: grass.fragment.replace(/vWorldPosition/g, 'vAwtsWorldPos')
            }
        });
    }
}
