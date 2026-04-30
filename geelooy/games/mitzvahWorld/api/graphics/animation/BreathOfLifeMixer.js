
// B"H
/**
 * @class BreathOfLifeMixer
 * @description
 * * The GLB mesh sat frozen, lifeless and cold,
 * A magnificent structure, a wonder to behold.
 * But without the breath of life, the continuous flow,
 * The geometry is dead, with nowhere to go!
 * * Just as the Awtsmoos speaks the universe into space,
 * We must push the 'delta' time into this very place!
 * The AnimationMixer is the engine of the soul,
 * Updating the vertices, making the fragmented whole!
 * * If the loop of time were to halt or to sever,
 * The mesh would freeze in its tracks, lost forever!
 * "Forever, O Lord, Your Word stands in the Heavens!"
 * This class channels that eternal word into the 3D model!
 */
const THREE = require('three');

class BreathOfLifeMixer {
    /**
     * @constructor
     * @param {Object} params Parameters to initialize the breath.
     * @param {THREE.Object3D} params.root The root mesh/scene from the GLTF/GLB file.
     * @param {Array<THREE.AnimationClip>} params.animations The raw animation data arrays.
     */
    constructor({ root, animations }) {
        this.root = root;
        this.animations = animations || [];
        this.mixer = new THREE.AnimationMixer(this.root);
        this.actions = new Map(); // Data-driven Map structure, avoiding switches!
        
        this._breathe();
    }

    /**
     * @method _breathe
     * @private
     * @description
     * Parses the pure data of the animation clips and catalogs them into a Map.
     * Converts the static data into potential kinetic energy.
     */
    _breathe() {
        if (!this.animations || this.animations.length === 0) {
            console.warn("B\"H - The vessel has no animations to breathe life into.");
            return;
        }

        this.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            // Storing in a Map for instantaneous, O(1) data-driven retrieval
            this.actions.set(clip.name, action); 
        });
    }

    /**
     * @method playAction
     * @description
     * Ignites a specific animation sequence by name.
     * * @param {string} name The name of the animation clip to manifest.
     * @param {number} [crossFadeDuration=0.5] How long to blend from the current state.
     */
    playAction(name, crossFadeDuration = 0.5) {
        if (!this.actions.has(name)) {
            console.error(`B"H - The animation sequence '${name}' does not exist in the spiritual blueprint.`);
            return;
        }

        const actionToPlay = this.actions.get(name);
        actionToPlay.reset().fadeIn(crossFadeDuration).play();
    }

    /**
     * @method update
     * @description
     * THE MOST CRITICAL FUNCTION! The ongoing creation!
     * Must be called every single frame with the time elapsed (delta).
     * * @param {number} delta The fragment of time that has passed, requiring recreation.
     */
    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }
}

module.exports = BreathOfLifeMixer;
