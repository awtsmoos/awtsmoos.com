
// B"H
/**
 * @file remover.js
 * @module TokenRemover
 * @description
 *  =======================================================================================
 *  CHAPTER 11: THE SEVERING OF THE TIES (HISTALKUS)
 *  =======================================================================================
 *  Removes a document's physical pointer from a token constellation. The search
 *  cache is updated alongside the persistent sequence so later same-process
 *  additions remain correct.
 */

const Sequence = require('../../../structure/sequence/index.js');
const constants = require('../../../constants.js');
const PhysicalIdentity = require('./phys_id.js');
const PhysCache = require('./physCache.js');

class TokenRemover {
    /**
     * @method remove
     * @description Severs a raw pointer from a specific token's constellation.
     * @param {Object} db The database context.
     * @param {Object} indexHandle The LiveHandle of the master search index.
     * @param {string} token The specific word-spark.
     * @param {Buffer} ptrToRemove The raw physical pointer to sever.
     */
    static remove(db, indexHandle, token, ptrToRemove) {
        const tokenList = indexHandle[token];
        if (!tokenList) return;

        const targetId = PhysicalIdentity.get(ptrToRemove);
        const listInt = tokenList[constants.SYMBOLS.INTERNALS];
        if (!listInt) return;

        listInt.ensureResolved();
        if (!listInt.ptr) return;

        const struct = listInt.nav.resolveStructPtr();
        if (!struct) return;

        const seq = new Sequence(db.allocator, struct);
        const len = seq.length();

        let idxToRemove = -1;

        for (let i = 0; i < len; i++) {
            const p = seq.getPtr(i);
            if (p && PhysicalIdentity.get(p) === targetId) {
                idxToRemove = i;
                break;
            }
        }

        if (idxToRemove !== -1) {
            tokenList.splice(idxToRemove, 1);
            PhysCache.deleteTokenId(indexHandle, token, targetId);

            if (tokenList.length === 0) {
                delete indexHandle[token];
                PhysCache.clearToken(indexHandle, token);
            }
        }
    }
}

module.exports = TokenRemover;
