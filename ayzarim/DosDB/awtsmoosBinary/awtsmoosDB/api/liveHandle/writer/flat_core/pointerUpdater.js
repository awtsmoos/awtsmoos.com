
// B"H
/**
 * @file pointerUpdater.js
 * @description Synchronizes the physical coordinates of the live handle automatically.
 */
const SmartPointer = require('../../../../utils/smartPointer/index.js');
module.exports = {
    update(res, handle) {
        if (res && res.ptr) {
            const buf = Buffer.isBuffer(res.ptr) ? res.ptr : SmartPointer.toBuffer(res.ptr);
            if (!handle.ptr || Buffer.compare(handle.ptr, buf) !== 0) {
                const decoded = SmartPointer.decode(buf);
                if (decoded) handle.type = decoded.type;
                handle._updatePointer(buf);
            }
        }
    }
};
