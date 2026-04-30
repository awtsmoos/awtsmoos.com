
// B"H
/**
 * @file index.js (Builder Logic)
 * @chapter The Grand Order of Emanation (Seder Hishtalshelus)
 */

const constants = require('../../../../../constants.js');
const MarkerLogic = require('../marker/index.js');
const SequenceManifestor = require('../vessel/sequence/index.js');
const MapManifestor = require('../vessel/map/index.js');
const DictManifestor = require('../vessel/dict/index.js');

class BuilderLogic {
    constructor(builder) {
        this.builder = builder;
    }

    determineRitual(val) {
        const T = constants.VAL_TYPE;
        if (Array.isArray(val)) return T.SEQUENCE;

        const marked = MarkerLogic.getTargetType(val);
        if (marked !== null) return marked;

        return T.DICTIONARY;
    }

    executeRitual(type, val, visited) {
        const T = constants.VAL_TYPE;

        const rituals = {
            [T.SEQUENCE]: () => SequenceManifestor.manifest(this.builder, val, visited),
            [T.MAP]:      () => MapManifestor.manifest(this.builder, val, visited),
            [T.DICTIONARY]: () => DictManifestor.manifest(this.builder, val, visited)
        };

        const ritual = rituals[type] || rituals[T.DICTIONARY];
        return ritual();
    }
}

module.exports = BuilderLogic;
