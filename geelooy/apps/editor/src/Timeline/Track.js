// B"H
import * as THREE from 'three';
import { Keyframe } from './Keyframe.js';

/**
 * Manages keyframes for a specific animatable property of an object.
 * (e.g., position.x, rotation.y, scale.z, material.color.r)
 */
export class Track {
    /**
     * @param {string} objectUUID - UUID of the object this track belongs to.
     * @param {string} propertyPath - Path to the property (e.g., 'position.x', 'rotation.y', 'scale.z', 'material.opacity').
     */
    constructor(objectUUID, propertyPath) {
        this.objectUUID = objectUUID;
        this.propertyPath = propertyPath;
        this.keyframes = []; // Sorted array of Keyframe objects
        this.id = `track-${objectUUID}-${propertyPath.replace('.', '_')}`;
    }

    /**
     * Adds a keyframe or updates an existing one at the same time.
     * @param {Keyframe} keyframe
     */
    addKeyframe(keyframe) {
        // Remove existing keyframe at the exact same time, if any
        this.removeKeyframeAt(keyframe.time);

        this.keyframes.push(keyframe);
        // Keep keyframes sorted by time
        this.keyframes.sort((a, b) => a.time - b.time);
    }

     /**
     * Removes a keyframe at a specific time.
     * @param {number} time - The time of the keyframe to remove.
     * @returns {boolean} True if a keyframe was removed, false otherwise.
     */
     removeKeyframeAt(time) {
        const index = this.keyframes.findIndex(kf => Math.abs(kf.time - time) < 0.001); // Tolerance for float comparison
        if (index !== -1) {
            this.keyframes.splice(index, 1);
            return true;
        }
        return false;
     }

     /**
     * Gets the keyframe at a specific time (within tolerance).
     * @param {number} time
     * @returns {Keyframe | null}
     */
     getKeyframeAt(time) {
         return this.keyframes.find(kf => Math.abs(kf.time - time) < 0.001) || null;
     }


    /**
     * Gets the interpolated value at a specific time.
     * @param {number} time - The current time.
     * @returns {*} The interpolated value, or null if no keyframes exist or time is outside range.
     */
    getValue(time) {
        if (this.keyframes.length === 0) {
            return null; // No keyframes, no value
        }

        // Find bounding keyframes
        let prevKeyframe = null;
        let nextKeyframe = null;

        for (let i = 0; i < this.keyframes.length; i++) {
            if (this.keyframes[i].time <= time) {
                prevKeyframe = this.keyframes[i];
            }
            if (this.keyframes[i].time >= time && !nextKeyframe) {
                nextKeyframe = this.keyframes[i];
                // We can potentially break here if list is sorted, but check edge cases
            }
        }

        // --- Handle edge cases ---
        if (!prevKeyframe) {
            // Time is before the first keyframe
            return this.keyframes[0].value; // Hold first value
        }
        if (!nextKeyframe) {
            // Time is after the last keyframe
            return this.keyframes[this.keyframes.length - 1].value; // Hold last value
        }
        if (prevKeyframe === nextKeyframe || Math.abs(prevKeyframe.time - nextKeyframe.time) < 0.001) {
            // Time is exactly on a keyframe
            return prevKeyframe.value;
        }

        // --- Interpolation ---
        const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);

        // TODO: Implement different interpolation types (STEP, CUBICSPLINE)
        // For now, only LINEAR
        const interpolationType = prevKeyframe.interpolation; // Use prev keyframe's interpolation type

        if (interpolationType === 'STEP') {
            return prevKeyframe.value;
        }

        // Default to LINEAR
        const startVal = prevKeyframe.value;
        const endVal = nextKeyframe.value;

        // Check value types for appropriate interpolation
        if (typeof startVal === 'number' && typeof endVal === 'number') {
            return THREE.MathUtils.lerp(startVal, endVal, t);
        } else if (startVal instanceof THREE.Vector2 && endVal instanceof THREE.Vector2) {
            return new THREE.Vector2().lerpVectors(startVal, endVal, t);
        } else if (startVal instanceof THREE.Vector3 && endVal instanceof THREE.Vector3) {
            return new THREE.Vector3().lerpVectors(startVal, endVal, t);
        } else if (startVal instanceof THREE.Quaternion && endVal instanceof THREE.Quaternion) {
             // Use slerp for quaternions
            return new THREE.Quaternion().slerpQuaternions(startVal, endVal, t);
        } else if (startVal instanceof THREE.Color && endVal instanceof THREE.Color) {
            return new THREE.Color().lerpColors(startVal, endVal, t);
        } else if (startVal instanceof THREE.Euler && endVal instanceof THREE.Euler) {
            // Interpolating Euler angles directly can cause gimbal lock issues.
            // Better to convert to Quaternions, slerp, and convert back if needed.
            // Or just lerp component-wise for simple cases (less accurate).
            // Simple lerp for now:
            return new THREE.Euler(
                THREE.MathUtils.lerp(startVal.x, endVal.x, t),
                THREE.MathUtils.lerp(startVal.y, endVal.y, t),
                THREE.MathUtils.lerp(startVal.z, endVal.z, t),
                startVal.order // Keep the same order
            );
        } else {
            // Unsupported type or type mismatch, return start value
            console.warn(`Unsupported type for linear interpolation on track ${this.propertyPath}:`, typeof startVal);
            return startVal;
        }
    }

     // --- Helper to get value nested property ---
     static getObjectPropertyValue(obj, path) {
        if (!obj || !path) return undefined;
        const props = path.split('.');
        let current = obj;
        for (let i = 0; i < props.length; i++) {
            if (current === null || typeof current === 'undefined') return undefined;
            current = current[props[i]];
        }
        return current;
    }

     // --- Helper to set value nested property ---
     static setObjectPropertyValue(obj, path, value) {
        if (!obj || !path) return;
        const props = path.split('.');
        let current = obj;
        for (let i = 0; i < props.length - 1; i++) {
             if (current === null || typeof current === 'undefined') return; // Path doesn't exist fully
            current = current[props[i]];
        }
         if (current !== null && typeof current !== 'undefined') {
            const finalProp = props[props.length - 1];
            // Check if the target property has a 'copy' or 'set' method (like Vector3, Color)
            if (current[finalProp] && typeof current[finalProp].copy === 'function') {
                 current[finalProp].copy(value);
            } else if (current[finalProp] && typeof current[finalProp].set === 'function') {
                 // Handle Color.set(hex), Euler.set(x,y,z,'ORD') - needs value check
                 if (value instanceof THREE.Color) current[finalProp].set(value);
                 else if (value instanceof THREE.Euler) current[finalProp].set(value.x, value.y, value.z, value.order);
                 // Add more specific .set cases if needed
                 else current[finalProp] = value; // Fallback to direct assignment
            } else {
                current[finalProp] = value; // Direct assignment for numbers, strings, etc.
            }
        }
    }
}