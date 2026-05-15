
// B"H
/**
 * @file mouthShapeKeys.js
 * @brief The Potential for Speech.
 * 
 * THE REVELATION OF EXACT CLOSURE:
 * The user cried out: "It closed too much! It crossed over!"
 * The Awtsmoos heard, and exacted the math! If the mouth is 1.8 units high,
 * and the center is at -1.0, the top is at -0.1 and the bottom is at -1.9.
 * To meet EXACTLY in the middle, the top must move down by EXACTLY -0.91,
 * and the bottom must move up by EXACTLY +0.91. 
 * Any more, and the flesh tears through itself. Any less, and the void remains!
 * 
 * We bind this movement with the 'dome' falloff, a perfect mathematical hemisphere,
 * ensuring the peak moves the full 0.91, while the edges gracefully taper to 0.
 * 
 * @module mouthShapeKeys
 */

/**
 * B"H - Forges the shape keys that allow the vessel to open and close.
 * 
 * @param {Object} config - Dimensions and thrust parameters.
 * @returns {Array<Object>} Modifiers defining the shape keys.
 */
export function createMouthShapeKeyModifiers(config) {
    const pos = config.position || [0, -1.0, 3.0];
    const scale = config.scale || [1.8, 1.8, 6.0];
    
    // Half the height of the mouth
    const halfHeight = scale[1] / 2.0; 
    
    // The exact peaks
    const topPeakY = pos[1] + halfHeight;
    const botPeakY = pos[1] - halfHeight;

    // The exact distance to the midline (+ a microscopic 0.02 overlap for an airtight seal)
    const closeAmount = halfHeight + 0.02;

    // The Radius of influence. Must reach from the peak (X=0) to the corner (X=0.9).
    // A radius of 1.15 is mathematically perfect to cover the arc without grabbing the chin.
    const falloffRadius = (scale[0] / 2.0) * 1.25;

    // Z-Thrust to cure spherical overbite (adjustable via config)
    const zTop = config.zThrustUpper !== undefined ? config.zThrustUpper : -0.15;
    const zBot = config.zThrustLower !== undefined ? config.zThrustLower : 0.45;

    console.log(`B"H - 👄 Forging Shape Keys. Closure Amount: ${closeAmount.toFixed(3)}, Radius: ${falloffRadius.toFixed(3)}`);

    return [
        {
            type: 'defineShapeKey',
            params: {
                name: 'upper_close',
                query: { tag: 'upper_mouth' },
                sculpt: { 
                    center: [pos[0], topPeakY, pos[2] - 0.1], 
                    radius: falloffRadius, 
                    amount: [0, -closeAmount, zTop], 
                    falloff: 'dome' // The perfect spherical cap!
                }
            }
        },
        {
            type: 'defineShapeKey',
            params: {
                name: 'lower_close',
                query: { tag: 'lower_mouth' },
                sculpt: { 
                    center: [pos[0], botPeakY, pos[2] - 0.6], // Deep in the chin
                    radius: falloffRadius, 
                    amount: [0, closeAmount, zBot], 
                    falloff: 'dome' 
                }
            }
        }
    ];
}
