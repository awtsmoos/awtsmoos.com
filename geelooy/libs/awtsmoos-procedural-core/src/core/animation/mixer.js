
// B"H
/**
 * @file mixer.js
 * @brief Blending logic for animation tracks. Mixing matrices and vectors to create fluid transitions.
 */
import { mat4_core } from '../math/mat4/core.js';

export const AnimationMixer = {
    /**
     * Blends two 4x4 matrices based on a weight.
     * @param {Array} a - Matrix A
     * @param {Array} b - Matrix B
     * @param {number} weight - 0 to 1
     */
    blendMatrices: (a, b, weight) => {
        if (weight <= 0) return [...a];
        if (weight >= 1) return [...b];
        const out = new Array(16);
        for (let i = 0; i < 16; i++) {
            out[i] = a[i] + (b[i] - a[i]) * weight;
        }
        return out;
    },

    /**
     * Blends multiple matrices with weights.
     * @param {Array} matrices - Array of [matrix, weight]
     */
    mixMatrices: (weightedMatrices) => {
        if (weightedMatrices.length === 0) return mat4_core.identity();
        if (weightedMatrices.length === 1) return weightedMatrices[0][0];

        let totalWeight = 0;
        const result = new Array(16).fill(0);

        weightedMatrices.forEach(([mat, weight]) => {
            for (let i = 0; i < 16; i++) {
                result[i] += mat[i] * weight;
            }
            totalWeight += weight;
        });

        if (totalWeight > 0) {
            for (let i = 0; i < 16; i++) result[i] /= totalWeight;
        }
        return result;
    }
};
