
/**
 * B"H
 * @file generateMesh.js
 * Generates Three.js meshes from golem definitions.
 * Fortified with extreme modular safety and multiple layers of fallbacks.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from '../../math/GeometryManager.js';
import SafeMaterialApplier from './SafeMaterialApplier.js';

export default async function generateThreeJsMesh(golem, olamContext) {
    const originalGolem = golem;
    if (!golem) golem = {};
    
    // --- 1. Geometry Formation (The Body) ---
    const guf = golem.guf || { "BoxGeometry": [1, 1, 1] };
    const [geomType, geomArgs] = Object.entries(guf)[0];
    
    let chomer; 
    try {
        if (GeometryManager.has(geomType)) chomer = GeometryManager.create(geomType, geomArgs);
        else if (THREE[geomType]) chomer = new THREE[geomType](...geomArgs);
        else chomer = new THREE.BoxGeometry(1,1,1);
    } catch (e) {
        console.warn("B\"H: Body formation failed, using box.");
        chomer = new THREE.BoxGeometry(1,1,1);
    }

    // --- 2. Material Manifestation (The Soul's Garment) ---
    const toyr = golem.toyr || { "MeshLambertMaterial": { color: "white" } };
    const [materialName, materialOptions] = Object.entries(toyr)[0];
    
    let tzurah;
    try {
        const finalOptions = {};
        if (materialOptions) {
            for (const [key, value] of Object.entries(materialOptions)) {
                if (key === 'color') finalOptions[key] = new THREE.Color(value);
                else if (key === 'map') finalOptions[key] = await olamContext.loadTexture({ 
                    url: value.startsWith("awtsmoos://") ? olamContext.getComponent(value) : value 
                });
                else finalOptions[key] = value;
            }
        }
        
        tzurah = SafeMaterialApplier.apply(materialName, finalOptions);

    } catch (e) {
        console.error("B\"H: Soul's garment failed! Emergency green manifested.");
        tzurah = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    }

    // --- 3. Final Calibration (Mapping and Matrix) ---
    try {
        if (tzurah.map && golem.textureRepeat) {
            tzurah.map.wrapS = tzurah.map.wrapT = THREE.RepeatWrapping;
            if (tzurah.map.repeat && typeof tzurah.map.repeat.set === 'function') {
                tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
            }
        }
    } catch (e) {}

    const mesh = new THREE.Mesh(chomer, tzurah);
    mesh.awtsmoosGolem = originalGolem;
    return mesh;
}
