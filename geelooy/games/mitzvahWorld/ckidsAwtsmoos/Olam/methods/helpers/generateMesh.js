
/**
 * B"H
 * @file generateMesh.js
 * Generates Three.js meshes from golem definitions.
 * NOW WITH GEOMETRY CACHING to prevent Out of Memory errors on large worlds.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import GeometryManager from '../../math/GeometryManager.js';
import ProceduralGenerators from '../../math/ProceduralGenerators.js';

// B"H: The Treasury of Forms (Cache)
const geometryCache = new Map();
const materialCache = new Map();

function getCachedGeometry(type, args) {
    const key = `${type}_${JSON.stringify(args)}`;
    if (geometryCache.has(key)) {
        return geometryCache.get(key);
    }
    return null;
}

function setCachedGeometry(type, args, geo) {
    const key = `${type}_${JSON.stringify(args)}`;
    geometryCache.set(key, geo);
}

export default async function generateThreeJsMesh(golem, olamContext) {
    const originalGolem = golem;
    if (!golem) golem = {};
    
    const keyMap = {
        color: val => new THREE.Color(val),
        map: async (val) => await olamContext.loadTexture({ url: val.startsWith("awtsmoos://") ? olamContext.getComponent(val) : val })
    };

    // --- Geometry Creation ---
    const guf = golem.guf || golem.body || { "BoxGeometry": [1, 1, 1] };
    const gufEntries = Object.entries(guf);
    const geomType = gufEntries[0][0];
    const geomArgs = gufEntries[0][1];
    
    let chomer; 

    // B"H: Attempt to retrieve from cache first (Strict Memory Control)
    // Only cache basic primitives without modifiers
    const isBasic = !golem.modifiers;
    if (isBasic) {
        chomer = getCachedGeometry(geomType, geomArgs);
    }

    if (!chomer) {
        if (GeometryManager.has(geomType)) {
            chomer = GeometryManager.create(geomType, geomArgs);
        } else if (THREE[geomType]) {
            chomer = new THREE[geomType](...geomArgs);
        } else {
            console.warn(`B"H: Geometry type ${geomType} not found. Defaulting to Box.`);
            chomer = new THREE.BoxGeometry(1,1,1);
        }
        
        // Cache it if it's basic
        if (isBasic && chomer) {
            setCachedGeometry(geomType, geomArgs, chomer);
        }
    }

    // --- Material Creation (May be array) ---
    const toyr = golem.toyr || golem.material || { "MeshLambertMaterial": { color: "white" } };
    let materials = [];
    
    // Check if multiple materials are defined in an array
    const materialDefs = Array.isArray(toyr) ? toyr : [toyr];

    for (const matDef of materialDefs) {
        const entries = Object.entries(matDef);
        const matName = entries[0][0];
        const matOpts = entries[0][1] || {};
        
        if (THREE[matName]) {
             const optionPromises = [];
             const optionKeys = [];
             const finalOptions = {};
             
             for (const [key, value] of Object.entries(matOpts)) {
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
            
            // B"H: Note - We are NOT caching materials yet because textures/colors vary too much per instance
            // and Three.js handles material sharing internally if configured right, but for now unique materials
            // are safer for the "mixTextures" logic.
            materials.push(new THREE[matName](finalOptions));
        }
    }
    
    // Flatten if single
    let tzurah = materials.length === 1 ? materials[0] : materials;

    // --- B"H: PROCEDURAL MODIFIERS ---
    let bones = null;
    let isSkinned = false;

    if (golem.modifiers && Array.isArray(golem.modifiers)) {
        // If modifiers exist, we MUST clone the geometry so we don't warp the cached version
        chomer = chomer.clone(); 
        const result = ProceduralGenerators.applyModifiers(chomer, golem.modifiers);
        chomer = result.geometry;
        bones = result.bones;
        isSkinned = result.isSkinned;
    }

    let mesh;

    // --- Mesh Construction ---
    if (isSkinned && bones) {
        mesh = new THREE.SkinnedMesh(chomer, tzurah);
        
        // Setup Skeleton
        const skeleton = new THREE.Skeleton(bones);
        mesh.add(bones[0]); // Add root bone
        mesh.bind(skeleton);
        
        mesh.userData.isLiving = true; 
    } else {
        mesh = new THREE.Mesh(chomer, tzurah);
    }

    // --- UV Mapping Fixes for Boxes ---
    if (geomType === 'BoxGeometry' && tzurah.map && !golem.modifiers) {
         const { width, height, depth } = chomer.parameters || {width:1, height:1, depth:1};
         if(tzurah.map && tzurah.map.repeat) { 
             tzurah.map.wrapS = THREE.RepeatWrapping;
             tzurah.map.wrapT = THREE.RepeatWrapping;
             tzurah.map.repeat.set(width, height);
         }
    }
    
    // Texture Repeat from Golem definition
    if (golem.textureRepeat && tzurah.map && tzurah.map.repeat) { 
        tzurah.map.wrapS = THREE.RepeatWrapping;
        tzurah.map.wrapT = THREE.RepeatWrapping;
        tzurah.map.repeat.set(golem.textureRepeat.x, golem.textureRepeat.y);
    }

    mesh.awtsmoosGolem = originalGolem;
    return mesh;
}
