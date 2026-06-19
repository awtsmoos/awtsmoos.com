
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * @class EmojiNature
 * @description
 * THE ALPHABET OF SYMBOLS (Otiyot HaSimanim).
 * B"H
 * 
 * "And He called the light Day." 
 * Names create reality. This forge takes a simple Emoji string and breathes 
 * its pixel-aura into the physical world space.
 * 
 * @module EmojiNature
 */
export class EmojiNature {
    /**
     * @function build
     * @description Spawns a nature emoji as a physical object.
     */
    static build(data, transform) {
        const size = data.size || 100;
        return G.group(`emoji_nature_${data.id}`, transform, [
            G.text('emoji_text', data.emoji, 0, 0, {
                font: `${size}px sans-serif`,
                align: 'center',
                baseline: 'bottom'
            })
        ]);
    }
}
