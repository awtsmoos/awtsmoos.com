
// B"H
/**
 * @file index.js (Anchor Resolution)
 * @chapter The Pillar of Yesod (Foundation)
 * 
 * Chapter 35: The Anchor Peek.
 * An Anchor (Type 50) is a stable coordinate on disk that shields 
 * growing structures from shattering. While its own address is fixed, 
 * the structure it points to moves during growth.
 * 
 * This resolution engine peels the shield to populate the 'soul' with 
 * current actual coordinates {offset, length} of the data structure.
 */

const constants = require('../../../../constants.js');

class AnchorResolution {
    /**
     * @method resolve
     * @description Re-aligns the handle's inner perception with the latest anchor contents.
     */
    static resolve(state) {
        if (state.type !== constants.VAL_TYPE.ANCHOR) return;

        const anchorSeal = state.ptr;
        if (!anchorSeal) return;

        // Reset stale perceptions to ensure we don't look back to an old universe.
        state.actualOffset = undefined;
        state.actualLength = undefined;
        state.effectiveType = undefined;

        // Command the navigator to peel the skin of the foundation block.
        const inner = state.nav.resolveAnchorInnerType();
        const coords = state.nav.resolveStructPtr();

        // Reveal the actual face of the data to the handle state.
        if (inner !== null && coords !== null) {
            state.effectiveType = inner;
            state.actualOffset = coords.offset;
            state.actualLength = coords.length;
        } else {
            // The anchor points to the void.
            state.effectiveType = constants.VAL_TYPE.NULL;
        }
    }
}

module.exports = AnchorResolution;
