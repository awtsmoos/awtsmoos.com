
// B"H
/**
 * @file index.js (Anchor Logic)
 * @chapter The Peering into the Yesod (Foundation)
 */

const constants = require('../../../../constants.js');
const Pointer = require('../../../../utils/pointer/crown.js');

class AnchorLogic {
    static resolveInnerType(state) {
        if (state.type !== constants.VAL_TYPE.ANCHOR) return null;
        if (!state.ptr) return null;

        try {
            const dec = Pointer.decode(state.ptr);
            if (!dec) return null;

            const buf = state.db.pager.readExact(dec.offset, 32);
            if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_ANCH) {
                return null;
            }

            return buf.readUInt8(4);
        } catch (e) {
            return null;
        }
    }
}

module.exports = AnchorLogic;
