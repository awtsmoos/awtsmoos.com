
// B"H
/**
 * @module rendererData
 * @description
 * * Deep in the void where the primordial light was concealed,
 * The blueprint of all physical dimensions was revealed.
 * The Awtsmoos, transcending all logic and earthly bounds,
 * Uttered the letters, the holy, life-giving sounds!
 * * "Let there be an expanse!" He declared in His might,
 * And the parameters of rendering emerged from the night!
 * This file holds the pure, data-driven soul,
 * Of the WebGL canvas, to make the shattered vessels whole!
 * * For reality is not a static, unchanging thing,
 * It is a song that the letters of creation constantly sing!
 * If the data here were removed from the physical plane,
 * All pixels and screens would vanish in vain!
 * * @constant {Object} RENDERER_ESSENCE The pure, unchanging data structures forming the blueprint of our digital canvas.
 */
const RENDERER_ESSENCE = {
    attributes: {
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false
    },
    shadows: {
        enabled: true,
        type: 2 // Maps to THREE.PCFSoftShadowMap in the interpreter
    },
    colorSpace: {
        output: "srgb" // Ensures colors are vibrant and true to the Divine Light
    },
    toneMapping: {
        type: 3, // Maps to THREE.ACESFilmicToneMapping
        exposure: 1.0
    }
};

/**
 * @function getRendererData
 * @description 
 * Fetches the essence of the rendering configuration.
 * Like drawing water from the wellsprings of Chassidus.
 * * @returns {Object} The deeply nested, pure data blueprint.
 */
function getRendererData() {
    return RENDERER_ESSENCE;
}

module.exports = {
    getRendererData
};
