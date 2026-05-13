// B"H
/**
 * @file core.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE HEART OF THE DATA — Core Operations                                 ║
 * ║                                                                          ║
 * ║  "Forever, O Lord, Your Word stands..."                                  ║
 * ║                                                                          ║
 * ║  The fundamental links between the Word and the World.                   ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default {
    "$var": (args, context) => {
        if (!args) return null;
        // Support nested paths like "hinge.hx"
        const parts = String(args).split('.');
        let current = context;
        for (const part of parts) {
            if (current === null || current === undefined) return null;
            current = current[part];
        }
        return current;
    },
    "$if": (args, context, evaluator) => {
        const condition = evaluator.evaluate(args[0], context);
        return condition ? evaluator.evaluate(args[1], context) : evaluator.evaluate(args[2], context);
    },
    "$vec3": (args) => ({ x: args[0] || 0, y: args[1] || 0, z: args[2] || 0 }),
    "$concat": (args) => args.join('')
};
