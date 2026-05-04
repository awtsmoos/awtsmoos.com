/**
 * B"H
 * 
 * THE KAV (RAY) - PRIMORDIAL LIGHT OF INTENTION
 * 
 * The Kav is the thin line of light that pierces the Tzimtzum (contraction).
 * It is the vector of Will that extends from the source (the Ayin/Camera)
 * into the world of Form (the Malchus).
 * 
 * Without the Kav, the world is a chaotic swirl of data.
 * With the Kav, we can pinpoint the sparks of divinity within the shells.
 * 
 * @module Kav
 */

/**
 * @class Kav
 * @description Handles the mathematical casting of the ray into the world.
 */
export default class Kav {
    /**
     * @constructor
     * @param {Object} olam - The Olam context.
     */
    constructor(olam) {
        this.olam = olam;
    }

    /**
     * @method cast
     * @description Casts the ray from the camera to the specified screen coordinates.
     * @param {number} x - Normalized mouse X (-1 to 1).
     * @param {number} y - Normalized mouse Y (-1 to 1).
     * @returns {Object|null} The hit result containing the nivra and intersection data.
     */
    cast(x, y) {
        if (!this.olam.ayin) return null;

        // Update the pointer in olam for the raycaster
        this.olam.pointer.x = x;
        this.olam.pointer.y = y;

        // The Ayin (Camera) knows how to see.
        const hit = this.olam.ayin.getHovered();

        if (hit) {
            const nivra = hit.nivraAwtsmoos || this.findNivraInHierarchy(hit.object);
            return {
                nivra: nivra,
                mesh: (nivra && nivra.modelMesh) ? nivra.modelMesh : hit.object,
                point: hit.point,
                distance: hit.distance,
                hit: hit
            };
        }

        return null;
    }

    /**
     * @method findNivraInHierarchy
     * @description Ascends the parent tree to find the root Nivra object.
     * @param {THREE.Object3D} object 
     * @returns {Object|null}
     */
    findNivraInHierarchy(object) {
        let current = object;
        while (current) {
            if (current.nivraAwtsmoos) return current.nivraAwtsmoos;
            current = current.parent;
        }
        return null;
    }
}
