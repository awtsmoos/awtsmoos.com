
// B"H
/**
 * @file index.js (Pop)
 * @description Withdraws the final spark from existence.
 */
class PopOp {
    static execute(state) {
        return () => {
            const len = state.reader.length();
            if (len === 0) return undefined;
            const val = state.reader.slice(len - 1, len)[0];
            state.writer.splice(len - 1, 1);
            return val;
        };
    }
}
module.exports = PopOp;
