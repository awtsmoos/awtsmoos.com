
// B"H
/**
 * Traversal.js
 * Chapter 17: The Refinement of the Kailim (Vessels)
 * "He refined the silver and gold of the sanctuary."
 * As we walk through the tree of existence, we find objects with differing
 * levels of readiness. Some lack the 'uv' coordinates through which textures
 * are applied, causing shader compilation failures. This module identifies
 * those empty vessels and fills them with a seed of zero-coordinates, 
 * satisfying the mathematical strictness of the GPU.
 */
import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import Utils from "../../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Traversal {
    /**
     * @function traverseVessel
     * @description Navigates and repairs every node of a Manifestation.
     */
    static async traverseVessel(meshRoot, nivra, olam, collections) {
        const { 
            placeholders, 
            thingsToRemove, 
            materials, 
            boneChildren, 
            garments, 
            bodyParts 
        } = collections;

        const allNodes = [];
        meshRoot.traverse(n => { allNodes.push(n); });

        let processed = 0;
        for (const node of allNodes) {
            processed++;
            if (processed % 100 === 0) await new Promise(r => setTimeout(r, 0));

            // B"H: The Sanctification of Geometry
            // Solving the 'uvundefined' error by ensuring 'uv' exists where shaders expect it.
            this._sanctifyGeometry(node);

            node.nivraAwtsmoos = nivra;

            if(node.type === "Bone") boneChildren[node.name] = node;
            if(node.userData?.garment) garments[node.userData.garment] = node;
            if(node.userData?.["body-part"]) bodyParts[node.userData["body-part"]] = node;
            
            if(node.userData?.water) {
                node.isWater = true;
                olam.ayshPeula("start water", node);
            }

            if(node.material) {
                // Ensure Map Matrix exists - solves 'reading elements of undefined'
                if (node.material.map && !node.material.map.matrix) {
                    node.material.map.matrix = new THREE.Matrix3();
                }
                
                Utils.replaceMaterialWithLambert(node);
                materials.push(node.material);
            }

            if(typeof(node.userData.placeholder) === "string") {
                const trans = olam.getTransformation(node);
                if(!placeholders[node.userData.placeholder]) placeholders[node.userData.placeholder] = [];
                placeholders[node.userData.placeholder].push({
                    ...trans, mesh: node, addedTo: false,
                    shlichus: node.userData.shlichus
                });
                thingsToRemove.push(node);
            }
        }
        return processed;
    }

    /**
     * @function _sanctifyGeometry
     * @private
     * @description Injects critical attributes into vessels that lack them.
     */
    static _sanctifyGeometry(node) {
        if (!node.geometry) return;

        // B"H: Ensuring UVs - the gateway for textures.
        // If a shader uses USE_MAP but geometry has no 'uv', WebGL errors out with 'uvundefined'.
        if (!node.geometry.attributes.uv) {
            // How many vertices?
            const count = node.geometry.attributes.position ? node.geometry.attributes.position.count : 1;
            const uvs = new Float32Array(count * 2); // Filled with zeros
            node.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        }

        // Morph Target stability
        if (node.geometry.morphAttributes && node.geometry.morphAttributes.position) {
            if (node.morphTargetInfluences === undefined) node.morphTargetInfluences = [];
        }

        // B"H: Sprite Specific Sanity
        if (node.isSprite && node.material && node.material.isSpriteMaterial) {
            // Force the matrix creation on the material's map
            if (node.material.map) {
                if (!node.material.map.matrix) node.material.map.matrix = new THREE.Matrix3();
                if (typeof node.material.map.updateMatrix === 'function') node.material.map.updateMatrix();
            }
        }
    }
}
