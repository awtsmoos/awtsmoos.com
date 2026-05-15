
// B"H
/**
 * @file mouthCutter.js
 * @brief The First Emanation of the Oral Vessel.
 * 
 * THE CHRONICLES OF THE CARVED VOID:
 * Before the Golem could speak the letters of Creation, the solid block of its face
 * had to undergo Tzimtzum (Contraction). The Awtsmoos withdrew the Light to create a space,
 * a void where the breath could resonate. 
 * This module manifests that void using Constructive Solid Geometry (CSG), 
 * thrusting a cylindrical cutter into the flesh, and coloring the internal walls 
 * with the crimson of life! For even in the emptiness, the letters Aleph, Beis, Nun (Even/Rock)
 * sustain the boundaries of the hole.
 * 
 * @module mouthCutter
 */

/**
 * @typedef {Object} MouthCutterConfig
 * @property {Array<number>} position - [x,y,z] The center of the mouth void.
 * @property {Array<number>} rotation - [x,y,z] The Euler rotation of the cutter.
 * @property {Array<number>} scale - [x,y,z] Width, Height, and Depth of the cut.
 * @property {Array<number>} innerColor - [r,g,b,a] The color of the mouth interior.
 */

/**
 * B"H - Forges the modifier that carves the infinite void into the mesh.
 * 
 * @param {MouthCutterConfig} config - The sacred dimensions of the cut.
 * @returns {Object} A modifier object ready to be interpreted by the engine.
 */
export function createMouthCutterModifier(config) {
    console.log(`B"H - 🪓 Forging the CSG Cutter for the Mouth at [${config.position}]...`);
    
    return {
        type: 'csgPrimitiveSubtract',
        params: {
            primitive: 'cylinder',
            parameters: { 
                radiusTop: 0.5, 
                radiusBottom: 0.5, 
                height: 1.0, 
                radialSegments: 32, 
                color: config.innerColor || [0.8, 0.05, 0.1, 1.0] 
            },
            transform: {
                rotation: config.rotation || [Math.PI / 2, 0, 0], 
                scale: config.scale || [1.8, 1.8, 6.0], 
                position: config.position || [0, -1.0, 3.0]       
            },
            // Branding the newly exposed interior flesh so we can find the lips later!
            insideTag: 'mouth_cavity'          
        }
    };
}
