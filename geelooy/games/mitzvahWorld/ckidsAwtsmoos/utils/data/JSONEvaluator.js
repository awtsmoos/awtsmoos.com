// B"H
/**
 * @module JSONEvaluator
 * @description
 * 🧠 THE INTELLECT OF DATA 🧠
 * 
 * An insanely intense, purely data-based execution engine. 
 * Allows writing fully dynamic logic, mathematical operations, 
 * and variable referencing entirely within pure JSON data structures, 
 * completely decoupling logic from hardcoded JavaScript.
 * 
 * Example:
 * { "$add": [ { "$var": "width" }, 5 ] }
 */
export default class JSONEvaluator {
    /**
     * Recursively evaluates a JSON data structure containing nested operations.
     * @param {any} node The data to evaluate
     * @param {Object} context Variables injected into the evaluation context
     */
    static evaluate(node, context = {}) {
        if (Array.isArray(node)) {
            // Check if it's an operation block formatted as an array (less common, but possible)
            return node.map(item => this.evaluate(item, context));
        } else if (node !== null && typeof node === 'object') {
            const keys = Object.keys(node);
            
            // If the object is a single operation key (e.g., {"$add": [1, 2]})
            if (keys.length === 1 && keys[0].startsWith('$')) {
                return this.evaluateOperation(keys[0], node[keys[0]], context);
            }
            
            // Otherwise, recursively evaluate all properties of the object
            const result = {};
            for (const key in node) {
                result[key] = this.evaluate(node[key], context);
            }
            return result;
        }
        
        // Primitive values return themselves
        return node;
    }

    static evaluateOperation(op, argsNode, context) {
        // Some operations might need lazy evaluation (like $if), but for simplicity,
        // we eagerly evaluate arguments for most math operations.
        
        if (op === '$if') {
            // Lazy evaluation for $if: [condition, trueBranch, falseBranch]
            const condition = this.evaluate(argsNode[0], context);
            if (condition) {
                return this.evaluate(argsNode[1], context);
            } else {
                return this.evaluate(argsNode[2], context);
            }
        }

        const args = this.evaluate(argsNode, context);

        switch (op) {
            // Variables
            case '$var':
                return context[args] !== undefined ? context[args] : null;
            
            // Math
            case '$add':
                return (args[0] || 0) + (args[1] || 0);
            case '$sub':
                return (args[0] || 0) - (args[1] || 0);
            case '$mul':
                return (args[0] || 0) * (args[1] || 0);
            case '$div':
                return (args[1] !== 0) ? ((args[0] || 0) / args[1]) : 0;
            case '$mod':
                return (args[1] !== 0) ? ((args[0] || 0) % args[1]) : 0;
            case '$max':
                return Math.max(...(Array.isArray(args) ? args : [args]));
            case '$min':
                return Math.min(...(Array.isArray(args) ? args : [args]));
            case '$sqrt':
                return Math.sqrt(args);
            case '$pow':
                return Math.pow(args[0], args[1]);
            case '$abs':
                return Math.abs(args);
            case '$sin':
                return Math.sin(args);
            case '$cos':
                return Math.cos(args);
            case '$tan':
                return Math.tan(args);
            case '$rad': // Degrees to Radians
                return (args * Math.PI) / 180;
                
            // Constants
            case '$pi':
                return Math.PI;
            
            // Spatial Helpers
            case '$vec3':
                return { x: args[0] || 0, y: args[1] || 0, z: args[2] || 0 };
                
            // Logic
            case '$eq':
                return args[0] === args[1];
            case '$neq':
                return args[0] !== args[1];
            case '$gt':
                return args[0] > args[1];
            case '$gte':
                return args[0] >= args[1];
            case '$lt':
                return args[0] < args[1];
            case '$lte':
                return args[0] <= args[1];
            case '$and':
                return args[0] && args[1];
            case '$or':
                return args[0] || args[1];
            case '$not':
                return !args;
                
            // Arrays & Data manipulation
            case '$concat':
                return Array.isArray(args[0]) ? args[0].concat(args[1]) : String(args[0]) + String(args[1]);
            case '$map':
                // args: [array, variableName, mapOperation]
                if (!Array.isArray(args[0])) return [];
                return args[0].map(item => {
                    const newContext = { ...context, [argsNode[1]]: item };
                    return this.evaluate(argsNode[2], newContext);
                });
            case '$length':
                return args.length || 0;

            default:
                console.warn(`B"H - ⚠️ Unknown divine operation: ${op}`);
                return args;
        }
    }
}
