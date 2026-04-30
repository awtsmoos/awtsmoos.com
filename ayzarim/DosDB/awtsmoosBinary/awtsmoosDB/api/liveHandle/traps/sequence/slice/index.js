
// B"H
/**
 * @file index.js (Slice)
 * @description Merely observes a segment of reality without altering it.
 */
class SliceOp {
    static execute(state) {
        return (start, end) => state.reader.slice(start, end);
    }
}
module.exports = SliceOp;
