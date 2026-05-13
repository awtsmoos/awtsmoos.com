// B"H
/**
 * @file logic.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE DISCERNMENT OF THE ESSENCE — Logical Operations                     ║
 * ║                                                                          ║
 * ║  "Between light and darkness..."                                         ║
 * ║                                                                          ║
 * ║  The binary distinctions that define the paths of existence.             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default {
    "$eq": (args) => args[0] === args[1],
    "$neq": (args) => args[0] !== args[1],
    "$gt": (args) => args[0] > args[1],
    "$gte": (args) => args[0] >= args[1],
    "$lt": (args) => args[0] < args[1],
    "$lte": (args) => args[0] <= args[1],
    "$and": (args) => args[0] && args[1],
    "$or": (args) => args[0] || args[1],
    "$not": (args) => !args
};
