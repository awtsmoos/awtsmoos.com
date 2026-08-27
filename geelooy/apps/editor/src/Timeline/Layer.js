// B"H
import { Track } from './Track.js';

/**
 * Represents a layer in the timeline, usually corresponding to one scene object (or group).
 * Contains tracks for the animatable properties of that object.
 */
export class Layer {
    /**
     * @param {string} objectUUID - The UUID of the associated scene object.
     * @param {string} objectName - The name of the object for display.
     */
    constructor(objectUUID, objectName) {
        this.objectUUID = objectUUID;
        this.objectName = objectName;
        this.tracks = new Map(); // Map<propertyPath, Track>
        this.id = `layer-${objectUUID}`;
        this.collapsed = false; // For UI state
    }

    /**
     * Adds a track for a specific property path if it doesn't exist.
     * @param {string} propertyPath - e.g., 'position.x'
     * @returns {Track} The new or existing track.
     */
    addTrack(propertyPath) {
        if (!this.tracks.has(propertyPath)) {
            const newTrack = new Track(this.objectUUID, propertyPath);
            this.tracks.set(propertyPath, newTrack);
            return newTrack;
        }
        return this.tracks.get(propertyPath);
    }

    /**
     * Gets a track by its property path.
     * @param {string} propertyPath
     * @returns {Track | undefined}
     */
    getTrack(propertyPath) {
        return this.tracks.get(propertyPath);
    }

    /**
     * Removes a track by its property path.
     * @param {string} propertyPath
     */
    removeTrack(propertyPath) {
        this.tracks.delete(propertyPath);
    }

    /**
     * Adds a keyframe to the specified track.
     * @param {string} propertyPath
     * @param {Keyframe} keyframe
     */
    addKeyframe(propertyPath, keyframe) {
        const track = this.addTrack(propertyPath); // Ensure track exists
        track.addKeyframe(keyframe);
    }

     /**
     * Removes a keyframe from a specific track at a specific time.
     * @param {string} propertyPath
     * @param {number} time
     * @returns {boolean} True if removed.
     */
     removeKeyframeAt(propertyPath, time) {
        const track = this.getTrack(propertyPath);
        if (track) {
            return track.removeKeyframeAt(time);
        }
        return false;
     }

    /**
     * Gets all keyframes across all tracks in this layer.
     * @returns {Keyframe[]}
     */
    getAllKeyframes() {
        let allKeyframes = [];
        this.tracks.forEach(track => {
            allKeyframes = allKeyframes.concat(track.keyframes);
        });
        return allKeyframes;
    }

    /**
     * Updates the associated object's properties based on the current time.
     * @param {THREE.Object3D} object - The actual scene object.
     * @param {number} time - The current time.
     */
    apply(object, time) {
        if (!object || object.uuid !== this.objectUUID) {
             // console.warn(`Layer ${this.objectName} trying to apply to wrong object.`);
            return;
        }
        this.tracks.forEach(track => {
            const value = track.getValue(time);
            if (value !== null) {
                // Apply the value to the object's property
                try {
                    Track.setObjectPropertyValue(object, track.propertyPath, value);
                } catch (e) {
                    console.error(`Error applying value to ${this.objectName}.${track.propertyPath}:`, e, "Value:", value);
                }
            }
        });
    }
}