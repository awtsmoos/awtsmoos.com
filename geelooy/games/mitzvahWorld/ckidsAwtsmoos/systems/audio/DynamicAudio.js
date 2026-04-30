
/**
 * B"H
 * @module DynamicAudio
 * @description
 * Dynamic procedural audio orchestrator. Routes physical events to their specific 
 * generative modules, synthesizing existence without reliance on pre-recorded files.
 */
import Synthesizer from "./Synthesizer.js";
import AudioEngine from "./AudioEngine.js";
import JumpSound from "./AudioGenerators/JumpSound.js";
import ImpactSound from "./AudioGenerators/ImpactSound.js";
import StepSound from "./AudioGenerators/StepSound.js";

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
