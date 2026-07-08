
/**
 * B"H
 * @module DynamicAudio
 * @description
 * Dynamic procedural audio orchestrator. Routes physical events to their specific 
 * generative modules, synthesizing existence without reliance on pre-recorded files.
 */
import Synthesizer from "./Synthesizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import AudioEngine from "./AudioEngine.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import JumpSound from "./AudioGenerators/JumpSound.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ImpactSound from "./AudioGenerators/ImpactSound.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import StepSound from "./AudioGenerators/StepSound.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class DynamicAudio {
    /**
     * @function triggerImpact
     * @description Calculates and plays the sound of hitting the floor.
     * @param {number} downwardVelocity - How fast the soul was falling.
     */
    static triggerImpact(downwardVelocity) {
        AudioEngine.init(); // Ensure context exists
        const blueprint = ImpactSound.generateBlueprint(downwardVelocity);
        Synthesizer.manifest(blueprint, { volume: blueprint.volume });
    }

    /**
     * @function triggerJump
     * @description Calculates and plays the sound of leaping.
     * @param {number} jumpVelocity - The force of the jump.
     */
    static triggerJump(jumpVelocity = 10) {
        AudioEngine.init();
        const blueprint = JumpSound.generateBlueprint(jumpVelocity);
        Synthesizer.manifest(blueprint, { volume: blueprint.volume });
    }

    /**
     * @function triggerStep
     * @description Calculates and plays the sound of a footstep.
     */
    static triggerStep() {
        AudioEngine.init();
        const blueprint = StepSound.generateBlueprint();
        Synthesizer.manifest(blueprint, { volume: blueprint.volume });
    }
}
