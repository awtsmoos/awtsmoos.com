
/**
 * B"H
 * @file utils.js
 * @description Dedicated utilities for the Chai (Living) entity.
 * Handles vector resets, state checking, and other spiritual/physical calculations
 * specific to living beings.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import Utils from "../../utils.js";

export default {
    /**
     * Resets the movement state object.
     * @param {Object} movingState 
     */
    resetMovingState(movingState) {
        Object.keys(movingState).forEach(k => movingState[k] = false);
    },

    /**
     * Determines the correct animation name based on state priorities.
     * @param {Object} map The animation map
     * @param {string} name The requested animation key
     * @returns {string|null}
     */
    resolveChaweeyoos(map, name) {
        const c = map[name];
        if(!c) return null;
        if(typeof(c) === "string") return c;
        if(typeof(c) === "function") return c();
        
        if(typeof(c) === "object") {
            const ran = Math.random();
            let sum = 0;
            let found = null;
            Object.entries(c).forEach(q => {
                if(found !== null) return;
                if(typeof(q[1]) === "number" && q[1] <= 1) sum += q[1];
                if(ran <= sum) found = q[0];
            });
            return found;
        }
        return null;
    },

    /**
     * Calculates the forward vector of a mesh, flattening Y for ground movement.
     * @param {THREE.Object3D} mesh 
     * @param {THREE.Vector3} targetVector 
     * @returns {THREE.Vector3}
     */
    getFlatForwardVector(mesh, targetVector) {
        return Utils.getForwardVector(mesh, targetVector);
    }
};
