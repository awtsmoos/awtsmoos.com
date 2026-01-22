// B"H
/**
 * @file traps_seq.js
 * @description Sequence (List) specific proxy traps.
 */

module.exports = function createSequenceMethods(reader, writer, state) {
    return {
        push: (...args) => writer.push(...args),
        pop: () => {
            const len = reader.length();
            if (len === 0) return undefined;
            const val = reader.slice(len - 1, len)[0]; 
            writer.splice(len - 1, 1);
            return val;
        },
        shift: () => {
            if (reader.length() === 0) return undefined;
            const val = reader.slice(0, 1)[0];
            writer.splice(0, 1);
            return val;
        },
        unshift: (...items) => writer.splice(0, 0, ...items),
        splice: (...args) => writer.splice(...args),
        slice: (start, end) => reader.slice(start, end),
        
        forEach: (cb) => {
            let idx = 0;
            for (const item of reader.values()) cb(item, idx++, state.self);
        },
        map: (cb) => {
            const res = [];
            let idx = 0;
            for (const item of reader.values()) res.push(cb(item, idx++, state.self));
            return res;
        },
        filter: (cb) => {
            const res = [];
            let idx = 0;
            for (const item of reader.values()) {
                if (cb(item, idx++, state.self)) res.push(item);
            }
            return res;
        },
        reduce: (cb, init) => {
            const iterator = reader.values();
            let acc = init;
            let idx = 0;
            if (acc === undefined) {
                const first = iterator.next();
                if (first.done) throw new TypeError("Reduce of empty array with no initial value");
                acc = first.value;
                idx = 1;
            }
            for (const item of iterator) acc = cb(acc, item, idx++, state.self);
            return acc;
        },
        find: (cb) => {
            let idx = 0;
            for (const item of reader.values()) {
                if (cb(item, idx++, state.self)) return item;
            }
            return undefined;
        },
        findIndex: (cb) => {
            let idx = 0;
            for (const item of reader.values()) {
                if (cb(item, idx++, state.self)) return idx - 1; 
            }
            return -1;
        },
        includes: (val) => {
            for (const item of reader.values()) if (item === val) return true;
            return false;
        },
        join: (sep = ',') => {
            let res = "";
            let first = true;
            for (const item of reader.values()) {
                if (!first) res += sep;
                res += String(item);
                first = false;
            }
            return res;
        },
        indexOf: (val) => {
            let idx = 0;
            for (const item of reader.values()) {
                if (item === val) return idx;
                idx++;
            }
            return -1;
        }
    };
};