
// B"H
/**
 * @file textureManager.js
 * @brief The divine artisan of surfaces, now humbled into Lazy Evaluation.
 * 
 * THE TRACTATE OF THE PATIENT SCRIBE:
 * Before, the Manager rushed to paint the earth and the sand,
 * Flooding the memory before the Awtsmoos gave the command!
 * But true creation emerges only from absolute Need,
 * A texture must slumber until it is called by a seed.
 * 
 * Now, the registry stands empty, a void of potential,
 * Waiting for the Shader to make the request essential.
 * Only then does the math spin the noise into gold,
 * Ensuring the RAM and the processor never grow old!
 */

import { TextureGenerator } from '../../textures/proceduralTextures.js';
import { EmojiGenerator } from '../../textures/emojiGenerator.js';

export class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textureGenerator = new TextureGenerator(gl);
        this.emojiGenerator = new EmojiGenerator(gl);
        this.textures = {};
        console.log("B\"H - TextureManager: Waiting in humble silence for the call to create.");
    }

    /**
     * B"H - This function is now a silent vow. We do not mass-generate textures anymore.
     * The universe must only load what it actively perceives.
     */
    generateCoreTextures() {
        // The void remains pure.
    }

    /**
     * @brief Retrieves a texture by its sacred name, manifesting it from nothing if it does not yet exist.
     * @param {string} name - The semantic name of the desired texture.
     * @returns {WebGLTexture|null} The manifested texture vessel.
     */
    getTexture(name) {
        if (!name) return null;
        
        // If the texture already exists in the book of life, return it instantly
        if (this.textures[name]) {
            return this.textures[name];
        }

        // The sacred mapping of names to their geometric generator types
        const typeMap = {
            'dirt': 'dirt', 'sand': 'sand', 'brick': 'brick', 'tile': 'tile',
            'cloth': 'cloth', 'oak': 'oak', 'pine': 'pine', 'birch': 'birch'
        };

        if (typeMap[name]) {
            console.log(`B"H - 🎨 TextureManager: The vessel requires '${name}'. Manifesting from the void now...`);
            this.textures[name] = this.textureGenerator.generate(name, typeMap[name]);
            return this.textures[name];
        }

        return null;
    }
}
