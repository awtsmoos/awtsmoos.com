// B"H
/**
 * @file ExpressionParser.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE UNIVERSAL TRANSLATOR — Expression Parser                            ║
 * ║                                                                          ║
 * ║  "Through the ten statements the world was created."                    ║
 * ║                                                                          ║
 * ║  A modular, extensible engine for evaluating JSON-based logic.           ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
import mathOps from './math.js';
import logicOps from './logic.js';
import coreOps from './core.js';

export default class ExpressionParser {
    static operations = {
        ...mathOps,
        ...logicOps,
        ...coreOps
    };

    /**
     * B"H
     * @method evaluate
     * @description
     * 📜 CHAPTER 3: THE DECODING OF THE SPEECH 📜
     * 
     * "Forever, Lord, Your Word stands in the heavens."
     * This method deciphers the coded letters ($operators) within the 
     * blueprint, translating the abstract Will into concrete values.
     * 
     * It recursively descends into the nested structures of the JSON,
     * resolving each node through the lens of the Divine Operations 
     * until the final manifestation is reached.
     * 
     * @param {any} node - The letter or word to be decoded.
     * @param {Object} context - The spiritual field for resolution.
     * @returns {any} The revealed essence of the expression.
     */
    static evaluate(node, context = {}) {
        if (Array.isArray(node)) {
            return node.map(item => this.evaluate(item, context));
        } else if (node !== null && typeof node === 'object') {
            const keys = Object.keys(node);
            
            // If it's an operation block
            if (keys.length === 1 && keys[0].startsWith('$')) {
                const op = keys[0];
                const argsNode = node[op];
                
                if (!this.operations[op]) {
                    console.warn(`B"H - ⚠️ Unknown divine operation: ${op}`);
                    return this.evaluate(argsNode, context);
                }

                // Lazy evaluation for $if
                if (op === '$if') {
                    return this.operations[op](argsNode, context, this);
                }

                // Eager evaluation for others
                const args = this.evaluate(argsNode, context);
                return this.operations[op](args, context, this);
            }
            
            // Otherwise, recurse through object properties
            const result = {};
            for (const key in node) {
                result[key] = this.evaluate(node[key], context);
            }
            return result;
        }
        
        return node;
    }
}
