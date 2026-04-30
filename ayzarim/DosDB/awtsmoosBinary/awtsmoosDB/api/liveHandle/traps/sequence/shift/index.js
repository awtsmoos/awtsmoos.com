
// B"H
/**
 * @file index.js (Shift)
 * @description Dissolves the very head of the sequence into nothingness.
 */
class ShiftOp {
    static execute(state) {
        return () => {
            const len = state.reader.length();
            if (len === 0) return undefined;
            const val = state.reader.slice(0, 1)[0];
            state.writer.splice(0, 1);
            return val;
        };
    }
}
module.exports = ShiftOp;
