
// B"H
/**
 * @file index.js (Sequence Iterators)
 */
class IterationOps {
    static forEach(state) {
        return (cb) => {
            let idx = 0;
            for (const item of state.reader.values()) cb(item, idx++, state.self);
        };
    }
    static map(state) {
        return (cb) => {
            const res =[];
            let idx = 0;
            for (const item of state.reader.values()) res.push(cb(item, idx++, state.self));
            return res;
        };
    }
    static filter(state) {
        return (cb) => {
            const res =[];
            let idx = 0;
            for (const item of state.reader.values()) {
                if (cb(item, idx++, state.self)) res.push(item);
            }
            return res;
        };
    }
}
module.exports = IterationOps;
