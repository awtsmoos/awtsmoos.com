
// B"H
/**
 * @file LineStyler.js
 * @brief THE GARMENTS OF THE UTTERANCE.
 * 
 * POEM OF THE REVEALED DIMENSION:
 * A thought once hidden, now stands in its place,
 * Expanding its form in the digital space.
 * From margin to margin, the line is now true,
 * Manifesting the answer from the model to you!
 */

export const LineStyler = {
    /**
     * B"H - Returns the base style for every row in the output area.
     * Enforces block behavior so lines don't overlap or hide.
     */
    getBaseStyle() {
        return {
            display: 'flex',
            width: '100%',
            minHeight: '28px', // B"H - Increased for better visual breathing
            padding: '6px 12px',
            margin: '0',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
            boxSizing: 'border-box',
            alignItems: 'center', // Center vertically
            gap: '10px',
            lineHeight: '1.5',
            wordBreak: 'break-all',
            fontFamily: 'var(--font-code), monospace'
        };
    },

    /**
     * B"H - The specific aura for an Echoed answer.
     */
    applyResultAura(style) {
        return {
            ...style,
            background: 'rgba(0, 246, 255, 0.05)',
            borderLeft: '4px solid var(--neon-lime)', // Lime indicates successful grounding
            color: 'var(--neon-cyan)',
            boxShadow: 'inset 0 0 20px rgba(0, 246, 255, 0.08)'
        };
    },

    applyInputAura(style) {
        return {
            ...style,
            background: 'transparent',
            borderLeft: '2px solid rgba(255,255,255,0.1)',
            color: 'white'
        };
    },

    applyErrorAura(style) {
        return {
            ...style,
            background: 'rgba(247, 93, 101, 0.05)',
            borderLeft: '4px solid var(--color-accent-danger)',
            color: 'var(--color-accent-danger)'
        };
    }
};
