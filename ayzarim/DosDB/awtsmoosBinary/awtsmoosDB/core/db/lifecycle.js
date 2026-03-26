
// B"H
/**
 * @file lifecycle.js
 * @description
 *  The Sefirot of Opening and Closing (Birth and Histalkus/Withdrawal).
 *  "He opens His hand and satisfies the desire of every living thing." (Psalms 145:16)
 *  
 *  When the database closes, it must ensure that every last spark of data hovering 
 *  in the ethereal Heap (Asiyah) is safely etched into the physical Pager before the 
 *  connection is severed. Otherwise, the souls of the data (like the number 9000) 
 *  will vanish into the abyss, leaving behind empty zeroes.
 */

const constants = require('../../constants.js');
const Dictionary = require('../../structure/dictionary/index.js');
const { readPointer48, writePointer48 } = require('../../utils/binary/helpers.js');
const HandleRegistry = require('../registry/handle.js');
const SmartPointer = require('../../utils/smartPointer.js');

module.exports = {
    /**
     * @method open
     * @description Breathes life into the physical vessel, awakening the Root.
     */
    open(db) {
        db.pager.init(); 
        db.allocator.init();
        
        let sb = db.pager.readBlock(0);
        let rid = readPointer48(sb, 64);
        let cur = readPointer48(sb, 128);
        let ptr = null;
        
        if (cur < 2 && rid === 0) {
            db.allocator.v1.updateSuperBlock((b) => { 
                b.fill(0); 
                writePointer48(b, 2, 128); 
            });
            
            ptr = (new Dictionary(db.allocator.v1)).create(); 
            const dec = SmartPointer.decode(ptr);
            
            db.allocator.v1.updateSuperBlock((b) => { 
                writePointer48(b, readPointer48(dec.payload, 0), 64); 
                b.writeUInt32BE(dec.payload.readUInt32BE(6), 70); 
                b.writeUInt32BE(dec.payload.readUInt32BE(10), 74); 
                b.writeUInt8(dec.payload.readUInt8(14), 78); 
            });
            
            db.rootPtrRaw = ptr; 
            db.pager.fsync(); 
        } else {
            ptr = SmartPointer.block(constants.VAL_TYPE.DICTIONARY, rid, sb.readUInt32BE(70), sb.readUInt8(78) === 1, sb.readUInt32BE(74));
            db.rootPtrRaw = ptr;
        }
        
        const soul = HandleRegistry.getSoul(db.root);
        if (soul) { 
            soul.ptr = ptr; 
            soul.type = constants.VAL_TYPE.DICTIONARY; 
            soul.lastMutationCount = -1; 
            soul.ensureResolved(true); 
        }
    },
    
    /**
     * @method close
     * @description 
     *  THE TIKKUN OF HISTALKUS (WITHDRAWAL).
     *  Before we sever the cord to the physical realm, we MUST ensure 
     *  all hovering sparks in the Heap and Background Queues descend into the stone.
     */
    close(db) { 
        if (typeof db.waitForIdle === 'function') {
            db.waitForIdle(); // Flushes the Heap and all pending background operations.
        }
        db.pager.close(); // Safely closes the file descriptor and syncs to disk.
    }
};
