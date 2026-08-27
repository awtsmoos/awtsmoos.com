
// B"H
/**
 * @file utils/smartPointer/core/mapper.js
 */

module.exports = {
    /**
     * @method toBuffer
     * @description Ensures every pointer is clothed in its binary garment.
     */
    toBuffer(ptr, SmartPointerRoot) {
        if (!ptr) return Buffer.alloc(0);
        if (Buffer.isBuffer(ptr)) return ptr;
        
        // Use the absolute Apex to encode the current Form.
        return SmartPointerRoot.encode(ptr.type || 0, ptr.offset || 0, ptr.length || 0);
    }
};
