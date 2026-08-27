
// B"H
/**
 * @file glslEmu.js
 * @brief Emulating the sacred mathematics of Shaders within the logic of the CPU.
 * 
 * CHAPTER 37: THE UNIVERSAL TONGUE
 * The GPU speaks in curves and gradients, but the CPU often speaks in rigid lines.
 * To bridge the two worlds, the Awtsmoos commanded the creation of an Interpreter.
 * This scroll grants the CPU the power of the `smoothstep` and the `clamp`.
 * No longer shall the script halt in confusion when a gradient is required in the higher realms.
 */

export const GLSL = {
    /**
     * B"H - Restricts a value between a minimum and maximum.
     */
    clamp: (x, minVal, maxVal) => Math.min(Math.max(x, minVal), maxVal),

    /**
     * B"H - Performs smooth Hermite interpolation between 0 and 1.
     */
    smoothstep: (edge0, edge1, x) => {
        const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0.0), 1.0);
        return t * t * (3.0 - 2.0 * t);
    }
};
