
// B"H
/**
 * @file index.js
 * @description
 *  Stateless resolution logic for database handles. 
 *  Operates on the soul (state) provided by the HandleRegistry.
 */
const SmartPointer = require('../../utils/smartPointer.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class LiveHandleLogic {
    constructor(state) {
        this.state = state;
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
            let parentSoul = null;
            if (this.state.context && this.state.context.parent) {
                parentSoul = HandleRegistry.getSoul(this.state.context.parent);
                if (parentSoul) {
                     // B"H: If we are being forced (bubbling), force the parent too
                     await parentSoul.ensureResolved(force);
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
                const result = await parentSoul.nav.resolveKey(this.state.context.key);
                if (result) {
                    this.state.ptr = result.ptr;
                    this.state.type = result.type;
                    
                    // Invalidate engine cache if the pointer has shifted
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
        
        const oldP = this.state.ptr ? this.state.ptr.toString('hex') : 'null';
        const newP = newPtrBuffer.toString('hex');
        
        // B"H: Always update the state pointer
        this.state.ptr = newPtrBuffer;
        const decoded = SmartPointer.decode(newPtrBuffer);
        if(decoded) this.state.type = decoded.type;
        
        // Invalidate engine cache because the internal data has been modified
        if (this.state.writer && this.state.writer.common) {
            this.state.writer.common.invalidateEngine();
        }

        // B"H: Sync mutation count so we don't immediately re-resolve our own update
        // during this specific transaction.
        this.state.lastMutationCount = this.state.db.mutationCount;
        
        const db = this.state.db;
        const isRoot = (this.state.context === null || (db.root && HandleRegistry.getSoul(db.root) === this.state));

        if (this.state.context && this.state.context.parent) {
            const pSoul = HandleRegistry.getSoul(this.state.context.parent);
            if (pSoul) {
                this.log(`Bubbling update to parent: ${pSoul.getPath()}`);
                // B"H: isPtr:true ensures the parent treats this as a structural update notification
                await pSoul.writer._setRaw(this.state.context.key, newPtrBuffer, { isPtr: true, skipFree: true });
            }
        } else if (isRoot) {
            this.state.db.rootPtrRaw = newPtrBuffer;
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
