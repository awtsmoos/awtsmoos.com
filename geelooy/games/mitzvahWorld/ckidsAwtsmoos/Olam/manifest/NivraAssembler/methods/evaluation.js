// B"H
/**
 * @file evaluation.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE WISDOM OF PROPORTION — Data Evaluation                              ║
 * ║                                                                          ║
 * ║  "He measured the waters in the hollow of His hand..." (Yeshayahu 40:12) ║
 * ║                                                                          ║
 * ║  Bridges the gap between static JSON and dynamic world coordinates.      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import ExpressionParser from '../evaluators/ExpressionParser/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    /**
     * @method evaluate
     * @description
     * Evaluates an expression within the current manifest context.
     * 
     * @param {any} expression - The JSON expression or value.
     * @param {Object} extraContext - Optional local overrides.
     * @returns {any} The result of the divine calculation.
     */
    evaluate(expression, extraContext = {}) {
        const fullContext = { ...this.context, ...extraContext };
        return ExpressionParser.evaluate(expression, fullContext);
    },

    /**
     * @method resolvePosition
     * @description Calculates a Vector3 position from a JSON descriptor.
     */
    resolvePosition(posNode) {
        if (!posNode) return { x: 0, y: 0, z: 0 };
        return {
            x: this.evaluate(posNode.x || 0),
            y: this.evaluate(posNode.y || 0),
            z: this.evaluate(posNode.z || 0)
        };
    }
};
