// B"H
import * as THREE from 'three';

export const Utils = {
    /**
     * Generates a unique ID for scene objects.
     * Follows the pattern: TypeName.001, TypeName.002 etc.
     * @param {string} baseName - The base type (e.g., 'Cube', 'Group', 'PointLight').
     * @param {function(string): THREE.Object3D | null} getObjectByNameFn - Function to check if a name exists (e.g., scene.getObjectByName).
     * @returns {string} A unique name.
     */
    generateUniqueName(baseName, getObjectByNameFn) {
        let name = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        if (!getObjectByNameFn(name)) {
            return name;
        }
        let counter = 1;
        while (getObjectByNameFn(`${name}.${counter.toString().padStart(3, '0')}`)) {
            counter++;
        }
        return `${name}.${counter.toString().padStart(3, '0')}`;
    },

    /**
     * Creates a simple debounce function.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The debounce delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Add other utility functions as needed (e.g., vector comparisons, angle conversions)
    vectorsEqual(v1, v2, tolerance = 0.0001) {
        if (!v1 || !v2) return false;
        return Math.abs(v1.x - v2.x) < tolerance &&
               Math.abs(v1.y - v2.y) < tolerance &&
               Math.abs(v1.z - v2.z) < tolerance;
    },

    quaternionsEqual(q1, q2, tolerance = 0.0001) {
        if (!q1 || !q2) return false;
         // Compare dot product, should be close to 1 or -1 for same rotation
         return Math.abs(q1.dot(q2)) > 1.0 - tolerance;
    }
};