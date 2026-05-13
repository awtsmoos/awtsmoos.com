// B"H
/**
 * @file math.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE GEOMETRY OF TRUTH — Mathematical Operations                        ║
 * ║                                                                          ║
 * ║  "He set a law which shall not be passed." (Tehillim 148:6)             ║
 * ║                                                                          ║
 * ║  The sacred calculations of the physical realm.                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default {
    "$add": (args) => (args[0] || 0) + (args[1] || 0),
    "$sub": (args) => (args[0] || 0) - (args[1] || 0),
    "$mul": (args) => (args[0] || 0) * (args[1] || 0),
    "$div": (args) => (args[1] !== 0) ? ((args[0] || 0) / args[1]) : 0,
    "$mod": (args) => (args[1] !== 0) ? ((args[0] || 0) % args[1]) : 0,
    "$pow": (args) => Math.pow(args[0], args[1]),
    "$sqrt": (args) => Math.sqrt(args),
    "$abs": (args) => Math.abs(args),
    "$sin": (args) => Math.sin(args),
    "$cos": (args) => Math.cos(args),
    "$tan": (args) => Math.tan(args),
    "$rad": (args) => (args * Math.PI) / 180,
    "$max": (args) => Math.max(...(Array.isArray(args) ? args : [args])),
    "$min": (args) => Math.min(...(Array.isArray(args) ? args : [args])),
    "$pi": () => Math.PI
};
