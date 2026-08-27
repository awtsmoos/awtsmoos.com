
/**
 * B"H
 * THE PAINTER OF LIGHT (COLOR HIGHLIGHTER)
 * 
 * Chapter: The True Manifestation
 * To change a vessel's color, we must speak the language of the Renderer. 
 * If the vessel uses `shaderVars.uBaseColor`, we must alter that! 
 * If it uses `color`, we alter that! We must cover all bases to force 
 * the engine to acknowledge the change.
 * 
 * @module ColorHighlighter
 */

export class ColorHighlighter {
    /**
     * B"H - Saves the original essence and paints the new Light.
     */
    static highlight(obj, rgb = [1.0, 0.8, 0.1]) {
        if (!obj) return;

        // 1. Save original state securely
        if (!obj._originalColorSaved) {
            // Check where the engine stores color
            if (obj.shaderVars && obj.shaderVars.uBaseColor) {
                obj._originalColor = [...obj.shaderVars.uBaseColor];
                obj._colorPath = 'shaderVars';
            } else if (obj.color) {
                obj._originalColor = [...obj.color];
                obj._colorPath = 'color';
            } else {
                obj._originalColor = [1, 1, 1]; // Fallback
                obj._colorPath = 'color';
            }
            obj._originalColorSaved = true;
        }

        // 2. Apply the new color to the correct path
        if (obj._colorPath === 'shaderVars') {
            obj.shaderVars.uBaseColor = [...rgb];
        } else {
            obj.color = [...rgb];
        }

        // 3. Force the engine to recognize the change
        obj.dirty = true;
        
        // Some engines require material dirty flags
        if (obj.material) obj.material.needsUpdate = true;
    }

    /**
     * B"H - Returns the vessel to its original physical state.
     */
    static reset(obj) {
        if (!obj || !obj._originalColorSaved) return;

        if (obj._colorPath === 'shaderVars') {
            obj.shaderVars.uBaseColor = [...obj._originalColor];
        } else {
            obj.color = [...obj._originalColor];
        }

        obj.dirty = true;
        if (obj.material) obj.material.needsUpdate = true;
    }

    /**
     * B"H - A momentary pulse of energy.
     */
    static flash(obj, flashColor = [1.0, 0.1, 0.1], durationMs = 200) {
        if (!obj) return;
        
        ColorHighlighter.highlight(obj, flashColor);
        
        setTimeout(() => {
            // If the mouse is still hovering it, return to hover color.
            // Otherwise, reset to normal.
            if (obj._isHovered) {
                ColorHighlighter.highlight(obj, [1.0, 0.8, 0.1]); // Yellow
            } else {
                ColorHighlighter.reset(obj);
            }
        }, durationMs);
    }
}
