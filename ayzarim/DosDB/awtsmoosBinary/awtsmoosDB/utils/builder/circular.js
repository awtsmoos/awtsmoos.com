
// B"H
/**
 * @file circular.js
 * @description The Shield against Infinite Loops.
 */
const SmartPointer = require('../smartPointer/index.js');

module.exports = {
    checkCircular(val, visited) {
        if (visited.has(val)) {
            const state = visited.get(val);
            if (state.building && typeof state.vessel.shatter === 'function') {
                if (!state.vessel.isShattered) {
                    state.vessel.shatter();
                }
            }
            return SmartPointer.toBuffer(state.vessel.ptr);
        }
        return null;
    }
};
