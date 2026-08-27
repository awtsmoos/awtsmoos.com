
// B"H
/**
 * @file mouthTagger.js
 * @chapter THE UNMASKING OF THE LIPS
 * 
 * THE PSALM OF THE TOPOLOGICAL TRACER:
 * The Diamond has cut the void, the internal walls remain!
 * Now we query the external skin, ending the topological pain.
 * We seek the exact neighbors of the inherited tags,
 * ensuring no pixel lags behind the Creator's intent!
 * 
 * @module MouthTagger
 */

export function createMouthTagModifiers(config) {
    console.log("B\"H - 🏷️ [MouthTagger]: Orchestrating the Reclamation of the Lip Seams...");

    return [
        // 1. RECLAIM UPPER LIPS
        {
            type: 'tagFaces',
            params: {
                tag: 'lip_upper',
                query: {
                    and: [
                        { grow: { fromQuery: { tag: 'mouth_wall_upper' }, steps: 1 } },
                        { inverse: { tag: 'mouth_inner_wall' } }
                    ]
                }
            }
        },

        // 2. RECLAIM LOWER LIPS
        {
            type: 'tagFaces',
            params: {
                tag: 'lip_lower',
                query: {
                    and: [
                        { grow: { fromQuery: { tag: 'mouth_wall_lower' }, steps: 1 } },
                        { inverse: { tag: 'mouth_inner_wall' } }
                    ]
                }
            }
        },

        // 3. RECLAIM CORNERS (Finding where Upper and Lower skin meet)
        {
            type: 'tagFaces',
            params: {
                tag: 'lip_corners',
                query: {
                    and: [
                        { tag: 'lip_upper' },
                        { grow: { fromQuery: { tag: 'lip_lower' }, steps: 1 } }
                    ]
                }
            }
        },

        // --- B"H - EXTREME DIAGNOSTIC LOGS ---
        { type: 'logSelection', params: { query: { tag: 'lip_upper' }, message: "✨ Upper Lip Sparks Found" } },
        { type: 'logSelection', params: { query: { tag: 'lip_lower' }, message: "✨ Lower Lip Sparks Found" } },
        { type: 'logSelection', params: { query: { tag: 'lip_corners' }, message: "✨ Corner Sparks Found" } }
    ];
}
