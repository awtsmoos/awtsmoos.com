
// B"H
/**
 * @class AnimatorBreath
 * @description
 * * Chapter 5: The Pulse of Movement
 * A model without animation is like a body without a soul,
 * A static, frozen vessel that cannot reach its goal!
 * We must ensure the AnimationMixer is being fed the time,
 * Turning the digital gears into a rhythmic rhyme.
 * * This class audits the playback, logging every frame,
 * Ensuring the "chossid.glb" is not just a statue in name!
 * If the mixer is idle, the world becomes cold,
 * But with the Breath of Life, the story is told!
 */
class AnimatorBreath {
    /**
     * @constructor
     * @param {THREE.AnimationMixer} mixer - The conduit for movement.
     */
    constructor(mixer) {
        this.mixer = mixer;
        this.lastLog = 0;
    }

    /**
     * @method sustain
     * @description 
     * Injects the delta time and logs the activity levels.
     * @param {number} delta - The slice of time since the last creation.
     */
    sustain(delta) {
        if (!this.mixer) return;

        this.mixer.update(delta);

        // Throttle logging to avoid overwhelming the spiritual channels
        const now = Date.now();
        if (now - this.lastLog > 2000) {
            const activeActions = this.mixer._actions.length;
            console.log(`B"H - 🏃 Animator State: ${activeActions} actions pulsing.`);
            this.lastLog = now;
        }
    }
}

module.exports = AnimatorBreath;
