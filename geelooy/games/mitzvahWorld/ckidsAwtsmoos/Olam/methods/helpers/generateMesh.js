/**
 * B"H
 * @file generateMesh.js
 * Generates Three.js meshes from golem definitions.
 * Refined to ensure robustness against invalid input types.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from '../../math/GeometryManager.js';

/**
 * generateThreeJsMesh - Synthesizes a mesh from its golem essence.
 * @param {Object} golem 
 * @param {Object} olamContext 
 */
export default async function generateThreeJsMesh(golem, olamContext) {
    const originalGolem = golem;
    if (!golem) golem = {};
    
    const keyMap = {
        color: val => new THREE.Color(val),
        map: async (val) => {
            // B"H: Extreme safety - handle potential non-string values
            if (typeof val !== 'string' || !val) return null;
            
            const url = val.startsWith("awtsmoos://") ? olamContext.getComponent(val) : val;
            return await olamContext.loadTexture({ url });
        }
    };

    // --- Geometry Creation ---
    const guf = golem.guf || golem.body || { "BoxGeometry": [1, 1, 1] };
    const gufEntries = Object.entries(guf);
    
    // B"H: Safety guard for empty geometry definitions
    if (gufEntries.length === 0) {
        console.warn("B\"H: Golem definition has no body. Providing default Cube.");
        gufEntries.push(["BoxGeometry", [1, 1, 1]]);
    }

    const geomType = gufEntries[0][0];
    const geomArgs = gufEntries[0][1];
    
    let chomer; 

    if (GeometryManager.has(geomType)) {
        chomer = GeometryManager.create(geomType, geomArgs);
    } else if (THREE[geomType]) {
        chomer = new THREE[geomType](...geomArgs);
    } else {
        console.warn(`B"H: Geometry type ${geomType} not found. Defaulting to Box.`);
        chomer = new THREE.BoxGeometry(1,1,1);
    }

    // --- Material Creation ---
    const toyr = golem.toyr || golem.material || { "MeshLambertMaterial": { color: "white" } };
    const toyrEntries = Object.entries(toyr);
    let tzurah;

    if (toyrEntries.length === 0) {
        toyrEntries.push(["MeshLambertMaterial", { color: "white" }]);
    }

    const materialName = toyrEntries[0][0];
    const materialOptions = toyrEntries[0][1] || {};

    if (THREE[materialName] && chomer) {
        const optionPromises = [];
        const optionKeys = [];
        const finalOptions = {};

        for (const [key, value] of Object.entries(materialOptions)) {
            if (keyMap[key]) {
                optionPromises.push(keyMap[key](value));
                optionKeys.push(key);
            } else {
                finalOptions[key] = value;
            }
        }

        const resolvedValues = await Promise.all(optionPromises);
        resolvedValues.forEach((value, index) => {
            finalOptions[optionKeys[index]] = value;
        });

        tzurah = new THREE[materialName](finalOptions);
    } else {
         // B"H Fallback material if creation fails
         tzurah = new THREE.MeshLambertMaterial({ color: "magenta", wireframe: true });
    }

    let mesh;

    // --- Mapping Logic ---
    if (geomType === 'BoxGeometry' && tzurah.map && chomer.parameters) {
        const { width, height, depth } = chomer.parameters;
        const texFront = tzurah.map; 
        const texSide = texFront.clone(); 
        const texTop = texFront.clone(); 

        [texFront, texSide, texTop].forEach(t => {
            if (t) {
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.needsUpdate = true; 
            }
        });

        if (texFront) texFront.repeat.set(width, height);
        if (texSide) texSide.repeat.set(depth, height);
        if (texTop) texTop.repeat.set(width, depth);

        const matFront = tzurah.clone(); matFront.map = texFront;
        const matSide = tzurah.clone(); matSide.map = texSide;
        const matTop = tzurah.clone(); matTop.map = texTop;

        mesh = new THREE.Mesh(chomer, [
            matSide, matSide, matTop, matTop, matFront, matFront 
        ]);

    } else if (GeometryManager.has(geomType) && tzurah.map) {
        tzurah.map.wrapS = THREE.RepeatWrapping;
        tzurah.map.wrapT = THREE.RepeatWrapping;
        if(golem.textureRepeat) {
             tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
        }
        mesh = new THREE.Mesh(chomer, tzurah);
    } else {
        mesh = new THREE.Mesh(chomer, tzurah);
        if (tzurah.map && golem.textureRepeat) {
            tzurah.map.wrapS = THREE.RepeatWrapping;
            tzurah.map.wrapT = THREE.RepeatWrapping;
            tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
            tzurah.map.needsUpdate = true;
        }
    }

    mesh.awtsmoosGolem = originalGolem;
    return mesh;
}