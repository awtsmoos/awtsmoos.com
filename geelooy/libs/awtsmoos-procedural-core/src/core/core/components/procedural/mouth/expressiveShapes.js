
// B"H
/**
 * @file expressiveShapes.js
 * @chapter THE SEALING OF THE WORD
 * 
 * THE HYMN OF THE PERFECT CLOSURE:
 * The mouth was born wide open, a cavern of truth.
 * But to speak the consonants of reality, it must close!
 * We forge the "Seal" key. It takes the Upper Lip and Lower Lip,
 * and flattens them perfectly to the exact horizontal midline.
 * No cranium is crushed. The Void is merely sealed!
 * 
 * @module ExpressiveShapes
 */

export function createMouthShapeKeyModifiers(config) {
    const pos = config.position || [0, 0, 3.0];
    const scale = config.scale || [1.6, 1.0, 1.0];
    
    // We use a generous radius to gently carry the cheeks with the lips
    const r = scale[0] * 1.5;

    console.log(`B"H - ✨ [ExpressiveShapes]: Weaving potential for [${pos}] with influence radius: ${r.toFixed(2)}`);

    return [
        // --- 🤐 THE PERFECT SEAL (Closes the Diamond) ---
        // Flattens the Upper and Lower lips to the horizontal midline (pos[1])
        {
            type: 'defineShapeKey',
            params: {
                name: 'mouth_seal',
                query: { or: [{ tag: 'lip_upper' }, { tag: 'lip_lower' }, { tag: 'lip_corners' }] },
                sculpt: { 
                    center: pos, 
                    radius: r, 
                    amount: { axis: 1, value: pos[1] }, 
                    falloff: 'flatten' // Absolute mathematical clamp to the midline
                }
            }
        },

        // --- 😊 THE SMILE ---
        // Pulls the corners out, up, and back into the cheeks
        {
            type: 'defineShapeKey',
            params: {
                name: 'mouth_smile',
                query: { tag: 'lip_corners' },
                sculpt: { center: pos, radius: r * 0.8, amount: [0.6, 0.5, -0.2], falloff: 'smooth' }
            }
        },

        // --- 😮 THE OH (PUCKER) ---
        // Pulls the lips forward and squishes them horizontally
        {
            type: 'defineShapeKey',
            params: {
                name: 'mouth_o',
                query: { or: [{ tag: 'lip_upper' }, { tag: 'lip_lower' }, { tag: 'lip_corners' }] },
                sculpt: { center: pos, radius: r, amount: [0, 0, 0.7], falloff: 'dome' }
            }
        }
    ];
}
