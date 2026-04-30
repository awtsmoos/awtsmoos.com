
// B"H
/**
 * @file index.js (Marker Logic)
 * @chapter The Identifying Signs (Simanim)
 */

const constants = require('../../../../../constants.js');

class MarkerLogic {
    static getTargetType(val) {
        if (!val || typeof val !== 'object' || Array.isArray(val)) return null;

        const T = constants.VAL_TYPE;

        if (val._isAwtsmoosMap) return T.MAP;
        if (val._isAwtsmoosList || val._isAwtsmoosSequence) return T.SEQUENCE;
        if (val._isAwtsmoosObject) return T.DICTIONARY;

        return null;
    }
}

module.exports = MarkerLogic;
