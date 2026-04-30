
// B"H
/**
 * @file index.js (Splice)
 * @description The Surgery of the Void. Severing and linking chains precisely.
 */
class SpliceOp {
    static execute(state) {
        return (start, del, ...items) => state.writer.splice(start, del, ...items);
    }
}
module.exports = SpliceOp;
