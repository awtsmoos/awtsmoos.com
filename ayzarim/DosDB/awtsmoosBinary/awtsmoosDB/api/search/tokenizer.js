// B"H
module.exports = {
    tokenize(text) {
        if (!text) return new Set();
        const str = String(text).toLowerCase();
        const tokens = str.split(/[^a-z0-9]+/);
        const set = new Set();
        for (const t of tokens) {
            if (t.length > 1) set.add(t);
        }
        return set;
    }
};
