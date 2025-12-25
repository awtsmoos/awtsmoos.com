
// B"H
/**
 * @file index.js
 * @description
 *  Stateless resolution logic for database handles. 
 *  Operates on the soul (state) provided by the HandleRegistry.
 */
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/handleRegistry.js');
const constants = require('../../constants.js');

class LiveHandleLogic {
    constructor(state) {
        this.state = state;
        // B"H: Initialize new state tracking for parent stability
        this.state.lastParentPtrHash = null;
    }

    log(msg) {
        if (this.state.db.debug) {
            console.log(`\x1b[35m[Soul:${this.getPath()}]\x1b[0m ${msg}`);
        }
    }

    /**
     * @description Syncs the handle with the database.
     */
    async ensureResolved(force = false) {
        const db = this.state.db;
        const gc = db.mutationCount || 0;
        
        // B"H: If we are not forced and mutation counts match, we are technically current.
        if (!force && this.state.ptr && this.state.lastMutationCount === gc) return;

        return db.read(async () => {
            let parentChanged = false;
            let parentSoul = null;

            if (this.state.context && this.state.context.parent) {
                parentSoul = HandleRegistry.getSoul(this.state.context.parent);
                if (parentSoul) {
                     // B"H: If we are being forced (bubbling), force the parent too
                     await parentSoul.ensureResolved(force);
                     
                     // B"H: Check if parent pointer moved
                     const currentParentHash = parentSoul.ptr ? parentSoul.ptr.toString('hex') : 'null';
                     if (this.state.lastParentPtrHash !== currentParentHash) {
                         parentChanged = true;
                         this.state.lastParentPtrHash = currentParentHash;
                     }
                }
            }

            const isRoot = (this.state.context === null || (db.root && HandleRegistry.getSoul(db.root) === this.state));
            
            if (isRoot) {
                if (db.rootPtrRaw) {
                    this.state.ptr = db.rootPtrRaw;
                    const decoded = SmartPointer.decode(this.state.ptr);
                    if (decoded) this.state.type = decoded.type;
                }
                this.state.lastMutationCount = db.mutationCount;
                return;
            }

            if (parentSoul) {
                let result = await parentSoul.nav.resolveKey(this.state.context.key);
                
                // B"H: Retry logic for transient misses if parent moved or cache stale
                if (!result && (force || parentChanged) && (parentSoul.type === constants.TYPE_DICTIONARY || parentSoul.type === constants.TYPE_MAP)) {
                     if (parentSoul.writer && parentSoul.writer.common) {
                         parentSoul.writer.common.invalidateEngine();
                     }
                     result = await parentSoul.nav.resolveKey(this.state.context.key);
                }

                if (result) {
                    this.state.ptr = result.ptr;
                    this.state.type = result.type;
                    
                    // B"H: Always invalidate engine cache if we are re-resolving,
                    // as the underlying data block may have been modified in-place.
                    if (this.state.writer && this.state.writer.common) {
                        this.state.writer.common.invalidateEngine();
                    }
                } else {
                    this.state.ptr = null;
                    this.state.type = null;
                }
            }
            
            this.state.lastMutationCount = db.mutationCount;
        });
    }

    getPath() {
        const parts = [];
        let curr = this.state;
        while (curr && curr.context) {
            parts.unshift(String(curr.context.key));
            const pSoul = HandleRegistry.getSoul(curr.context.parent);
            curr = pSoul || null;
        }
        return parts.length > 0 ? parts.join('.') : 'root';
    }

    /**
     * @description Authoritatively updates the pointer and notifies the parent hierarchy.
     */
    async _updatePointer(newPtrBuffer) {
        if (!newPtrBuffer) return;
        
        // B"H: Always update the state pointer
        this.state.ptr = newPtrBuffer;
        const decoded = SmartPointer.decode(newPtrBuffer);
        if(decoded) this.state.type = decoded.type;
        
        // Invalidate engine cache because the internal data has been modified
        if (this.state.writer && this.state.writer.common) {
            this.state.writer.common.invalidateEngine();
        }

        // B"H: Sync mutation count so we don't immediately re-resolve our own update
        this.state.lastMutationCount = this.state.db.mutationCount;
        
        const db = this.state.db;
        const isRoot = (this.state.context === null || (db.root && HandleRegistry.getSoul(db.root) === this.state));

        if (this.state.context && this.state.context.parent) {
            const pSoul = HandleRegistry.getSoul(this.state.context.parent);
            if (pSoul) {
                // Ensure parent is fresh before writing back to it
                await pSoul.ensureResolved(true);
                this.log(`Bubbling update to parent: ${pSoul.getPath()}`);
                // B"H: isPtr:true ensures the parent treats this as a structural update notification
                await pSoul.writer._setRaw(this.state.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
                // Update tracked hash since parent might have moved during _setRaw
                if (pSoul.ptr) this.state.lastParentPtrHash = pSoul.ptr.toString('hex');
            }
        } else if (isRoot) {
            // Update root pointer directly in DB and superblock
            this.state.db.rootPtrRaw = newPtrBuffer;
             if (decoded && decoded.mode === constants.MODE_BLOCK) {
                    const blockId = require('../../utils/binaryHelpers.js').readPointer48(decoded.payload, 0);
                    const len = decoded.payload.readUInt32BE(6);
                    const off = decoded.payload.readUInt32BE(10);
                    const isChain = decoded.payload.readUInt8(14) === 1;
                    
                    await this.state.db.allocator.v1.updateSuperBlock((sb) => {
                        require('../../utils/binaryHelpers.js').writePointer48(sb, blockId, 64);
                        sb.writeUInt32BE(len, 70);
                        sb.writeUInt32BE(off, 74);
                        sb.writeUInt8(isChain ? 1 : 0, 78);
                    });
            }
        }
    }
}

LiveHandleLogic.resolvePointer = async (ptrBuf, db) => {
    const SmartPointer = require('../../utils/smartPointer.js');
    const decoded = SmartPointer.decode(ptrBuf);
    if (!decoded) return null;
    return HandleRegistry.createHandle(db, ptrBuf, decoded.type, null);
};

module.exports = LiveHandleLogic;
