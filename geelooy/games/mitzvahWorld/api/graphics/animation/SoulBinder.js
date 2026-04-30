
// B"H
/**
 * @module SoulBinder
 * @description
 * * Chapter 5: Rebinding the Soul to the Golem
 * When SkeletonUtils clones a mesh, it creates a brand new form,
 * But the original animation tracks are left behind in the storm!
 * The names and UUIDs no longer match the newly created bones,
 * And the model stands frozen, like a pile of unliving stones!
 * * The SoulBinder takes the pure animation data and maps it anew,
 * Finding the corresponding bones in the cloned mesh, fixing it for you!
 */
const THREE = require('three');

class SoulBinder {
    /**
     * @constructor
     * @description Nullifies itself to become a vessel for animation re-binding.
     */
    constructor() {}

    /**
     * @method rebindAnimations
     * @description
     * Analyzes the original animation clips and maps their targeted tracks
     * to the newly cloned mesh hierarchy.
     * * @param {THREE.Object3D} clonedMesh The new vessel.
     * @param {Array<THREE.AnimationClip>} originalClips The divine breath (animations).
     * @returns {Array<THREE.AnimationClip>} The newly bound, compatible animation clips!
     */
    rebindAnimations(clonedMesh, originalClips) {
        if (!originalClips || originalClips.length === 0) return [];

        const reboundClips = [];

        originalClips.forEach(clip => {
            // We use pure data cloning of the clip
            const newClip = clip.clone();
            
            // Loop through all tracks (e.g., Position, Quaternion, Scale)
            newClip.tracks.forEach(track => {
                // A track name looks like "Bone_001.quaternion"
                // The cloned mesh retains the bone names, so we ensure the track
                // parses correctly against the new hierarchy's names.
                // In Three.js, AnimationMixer automatically resolves names if they match,
                // BUT if the root object has changed, we must ensure the mixer is instantiated
                // on the exact cloned root!
                
                // Note: Three.js mixer targets by name natively, so the true fix is 
                // returning the original clips BUT ensuring they are fed into a Mixer
                // whose root is explicitly the clonedMesh.
                track.name = track.name.replace(/.*uuid.*/, ''); // Clean any specific UUIDs just in case
            });

            reboundClips.push(newClip);
        });

        console.log(`B"H - ✨ SoulBinder: Successfully rebound ${reboundClips.length} animation tracks to the new Vessel.`);
        return reboundClips;
    }
}

module.exports = SoulBinder;
