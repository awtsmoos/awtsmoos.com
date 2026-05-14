
// B"H
/**
 * @file index.js (Dict Manifestor)
 * @chapter The House of Bina (Understanding)
 */

const Dictionary = require('../../../../../../structure/dictionary/index.js');
const StableAnchor = require('../../../../../../structure/anchor/stable.js');
const constants = require('../../../../../../constants.js');

const BUILT_IN_CLASS_NAMES = new Set([
    'Object',
    'Array',
    'Map',
    'Set',
    'WeakMap',
    'WeakSet',
    'Promise',
    'Date',
    'RegExp',
    'ArrayBuffer',
    'DataView'
]);

/**
 * @function makeCircularEntry
 * @description
 * Creates a lazy circular-reference entry for a dictionary that is still being
 * written. If another branch asks for this object before it is complete, the
 * entry manifests one stable anchor and later repoints it to the final compact
 * dictionary seal.
 *
 * @param {object} builder - StructBuilder instance.
 * @param {Dictionary} dictionary - Dictionary being filled.
 * @returns {object} Circular entry controller.
 */
function makeCircularEntry(builder, dictionary) {
    const anchor = new StableAnchor(builder.allocator.db);

    return {
        __awtsmoosCircularEntry: true,
        anchorSeal: null,

        reference() {
            if (!this.anchorSeal) {
                this.anchorSeal = anchor.create(
                    constants.VAL_TYPE.DICTIONARY,
                    dictionary.seal()
                );
            }

            return this.anchorSeal;
        },

        finish() {
            const finalSeal = dictionary.seal();
            if (!this.anchorSeal) return finalSeal;

            anchor.update(
                this.anchorSeal,
                constants.VAL_TYPE.DICTIONARY,
                finalSeal
            );

            return this.anchorSeal;
        }
    };
}

/**
 * @function shouldCapturePrototype
 * @description
 * Decides whether an object should carry prototype methods into storage.
 *
 * @param {*} value - Incoming value.
 * @returns {boolean} True for custom class instances.
 */
function shouldCapturePrototype(value) {
    if (!value || typeof value !== 'object') return false;
    if (value._isAwtsmoosMap || value._isAwtsmoosList || value._isAwtsmoosObject) {
        return false;
    }

    const ctor = value.constructor;
    if (!ctor || BUILT_IN_CLASS_NAMES.has(ctor.name)) return false;
    return Object.getPrototypeOf(value) !== Object.prototype;
}

/**
 * @function collectPrototypeMethods
 * @description
 * Walks a custom instance prototype chain and collects methods from child to
 * parent, without copying constructors or overwriting own data fields.
 *
 * @param {object} value - Custom class instance.
 * @param {Set<string>} occupied - Names already stored from own data.
 * @returns {Array<[string, Function]>} Method entries.
 */
function collectPrototypeMethods(value, occupied) {
    const methods = [];
    let proto = Object.getPrototypeOf(value);

    while (proto && proto !== Object.prototype) {
        for (const name of Object.getOwnPropertyNames(proto)) {
            if (name === 'constructor' || occupied.has(name)) continue;

            const descriptor = Object.getOwnPropertyDescriptor(proto, name);
            if (!descriptor || typeof descriptor.value !== 'function') continue;

            occupied.add(name);
            methods.push([name, descriptor.value]);
        }

        proto = Object.getPrototypeOf(proto);
    }

    return methods;
}

class DictManifestor {
    static manifest(builder, val, visited) {
        const d = new Dictionary(builder.allocator);
        d.create();
        const circularEntry = makeCircularEntry(builder, d);
        const occupied = new Set();

        visited.set(val, circularEntry);
        
        for (const k of Object.keys(val)) {
            if (k.startsWith('_isAwtsmoos')) continue;
            occupied.add(k);
            
            const valSeal = builder.build(val[k], visited);
            d.set(k, valSeal, { isPtr: true });
        }

        if (shouldCapturePrototype(val)) {
            const methods = collectPrototypeMethods(val, occupied);

            if (methods.length === 0) {
                const seal = circularEntry.finish();
                visited.set(val, seal);
                return seal;
            }

            const className = val.constructor && val.constructor.name
                ? val.constructor.name
                : 'Object';

            if (!occupied.has('__className__')) {
                d.set('__className__', builder.build(className, visited), {
                    isPtr: true
                });
            }

            for (const [methodName, method] of methods) {
                d.set(methodName, builder.build(method, visited), {
                    isPtr: true
                });
            }
        }
        
        const seal = circularEntry.finish();
        visited.set(val, seal);

        return seal;
    }
}

module.exports = DictManifestor;
