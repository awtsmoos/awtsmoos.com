// B"H

/**
 * Represents a single keyframe in time.
 */
export class Keyframe {
    /**
     * @param {number} time - Time in seconds.
     * @param {*} value - The value of the property at this time (can be number, Vector3, Quaternion, etc.).
     * @param {string} interpolation - Interpolation method (e.g., 'LINEAR', 'STEP', 'CUBICSPLINE'). Default 'LINEAR'.
     */
    constructor(time, value, interpolation = 'LINEAR') {
        this.time = time;
        this.value = this._cloneValue(value); // Ensure value is cloned
        this.interpolation = interpolation;
        this.id = `kf-${Date.now()}-${Math.random().toString(16).slice(2)}`; // Unique ID
    }

    _cloneValue(val) {
        if (val === null || typeof val !== 'object') {
            return val; // Primitives
        }
        if (typeof val.clone === 'function') {
            return val.clone(); // THREE.js objects (Vector3, Quaternion, Color, Euler)
        }
        if (Array.isArray(val)) {
            return val.map(item => this._cloneValue(item)); // Arrays
        }
        // Simple object clone (add deep clone if needed)
        return { ...val };
    }

    // Method to update value if needed
    updateValue(newValue) {
        this.value = this._cloneValue(newValue);
    }
}