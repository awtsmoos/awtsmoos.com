
// B"H
/**
 * @file index.js (Secrets)
 * @chapter The Hidden Chambers (Sitra De'Achrayuta)
 */

const constants = require('../../../../../constants.js');
const HandleRegistry = require('../../../../../core/registry/handle.js');

class SoulSecrets {
    static handle(state, prop) {
        if (prop === '__resolve__' || prop === 'valueOf' || prop === 'toJSON') {
            return () => state.reader.resolveSelf();
        }

        if (prop === constants.SYMBOLS.INTERNALS || prop === HandleRegistry.SOUL_SIG) {
            return state;
        }

        return undefined;
    }
}

module.exports = SoulSecrets;
