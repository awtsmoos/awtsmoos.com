
// B"H
/**
 * @file index.js (Secrets)
 * @chapter The Hidden Chambers (Sitra De'Achrayuta)
 */

const constants = require('../../../../../constants.js');
const HandleRegistry = require('../../../../../core/registry/handle.js');

class SoulSecrets {
    static _publicSoul(state) {
        if (state.__publicSoulView) return state.__publicSoulView;
        const T = constants.VAL_TYPE;
        state.__publicSoulView = new Proxy(state, {
            get(target, key, receiver) {
                if (key === 'type') {
                    if (target.type === T.ANCHOR && target.effectiveType !== undefined && target.effectiveType !== null) {
                        return target.effectiveType;
                    }
                    return target.type;
                }
                return Reflect.get(target, key, receiver);
            }
        });
        return state.__publicSoulView;
    }

    static handle(state, prop) {
        if (prop === '__resolve__' || prop === 'valueOf' || prop === 'toJSON') {
            return () => state.reader.resolveSelf();
        }

        if (prop === constants.SYMBOLS.INTERNALS || prop === HandleRegistry.SOUL_SIG) {
            return this._publicSoul(state);
        }

        return undefined;
    }
}

module.exports = SoulSecrets;
