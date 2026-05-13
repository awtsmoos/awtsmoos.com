// B"H
/**
 * @file index.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE NIVRA ASSEMBLER — THE UNIVERSAL TRANSLATOR OF ESSENCE               ║
 * ║                                                                          ║
 * ║  "And G-d said: Let there be..." (Bereishit 1:3)                         ║
 * ║                                                                          ║
 * ║  This is the Master Weaver of Reality. It takes the abstract JSON        ║
 * ║  blueprints of the Awtsmoos and crystallizes them into physical matter.   ║
 * ║  It does not rely on hardcoded JavaScript logic, but rather on the       ║
 * ║  Seder Hishtalshelus (Chain of Evolution) of data itself.               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import ChasveiAwtsmoos from '../../../utils/ChasveiAwtsmoos.js';
import ExpressionParser from './evaluators/ExpressionParser/index.js';

import evaluationMethods from './methods/evaluation.js';
import manifestationMethods from './methods/manifestation.js';
import transformationMethods from './methods/transformation.js';

/**
 * @class NivraAssembler
 * @description
 * The central engine for data-driven entity generation. 
 * Replaces imperative spawning logic with interpreted JSON manifests.
 */
export default class NivraAssembler {
    static evaluate(expression, extraContext = {}) {
        return ExpressionParser.evaluate(expression, extraContext);
    }

    static resolvePosition(posNode, extraContext = {}) {
        if (!posNode) return { x: 0, y: 0, z: 0 };
        return {
            x: this.evaluate(posNode.x || 0, extraContext),
            y: this.evaluate(posNode.y || 0, extraContext),
            z: this.evaluate(posNode.z || 0, extraContext)
        };
    }

    /**
     * B"H
     * @method assemble
     * @description
     * 📜 CHAPTER 1: THE CALL TO EXISTENCE 📜
     * 
     * "Let there be Light!"
     * This static command initiates the Seder Hishtalshelus for a blueprint.
     * it creates an instance of the Assembler (the vessel) and flows the 
     * Divine Blueprint through it to manifest the Nivrayim.
     * 
     * @param {Object} olam - The physical world (the field of creation).
     * @param {Object} blueprint - The blueprint of the entity.
     * @param {Object} context - The variables of the soul.
     * @returns {Promise<Array>} The manifested entities.
     */
    static async assemble(olam, blueprint, context = {}) {
        const instance = new this(olam, context);
        return await instance.processBlueprint(blueprint);
    }

    /**
     * B"H
     * @constructor
     * @description
     * 📜 CHAPTER 2: THE PREPARATION OF THE VESSEL 📜
     * 
     * Setting the stage for the revelation. The Assembler prepares 
     * to receive the Light of the Blueprint within the context of the Olam.
     */
    constructor(olam, context) {
        this.olam = olam;
        this.context = context;
        this.entities = [];
    }
}

// B"H - Grafting the modular limbs onto the trunk with divine emanate
ChasveiAwtsmoos.emanate(NivraAssembler.prototype, [
    evaluationMethods,
    manifestationMethods,
    transformationMethods
]);
