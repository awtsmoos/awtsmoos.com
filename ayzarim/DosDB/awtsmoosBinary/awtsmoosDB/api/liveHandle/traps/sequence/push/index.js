
// B"H
/**
 * @file index.js (Push)
 * @description The letters of speech form the newest addition to the tail of the stone.
 */
class PushOp {
    static execute(state) {
        return (...args) => {
            let res;
            for (const item of args) res = state.writer.push(item);
            return res;
        };
    }
}
module.exports = PushOp;
