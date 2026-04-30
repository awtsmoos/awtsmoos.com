
// B"H
/**
 * @file index.js (Unshift)
 * @description Installs new truth at the exact origin.
 */
class UnshiftOp {
    static execute(state) {
        return (...items) => state.writer.splice(0, 0, ...items);
    }
}
module.exports = UnshiftOp;
