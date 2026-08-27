// B"H
const fs = require('fs');
const p = 'api/liveHandle/writer/index.js';
let s = fs.readFileSync(p, 'utf8');
s = s.replace(
`    set(key, value, options = {}) {
        const isPtr = options === true || (options && options.isPtr);
        if (!isPtr && this.db._guardWrite) this.db._guardWrite(this._lockPath(key), value, 'set');`,
`    set(key, value, options = {}) {
        const isPtr = options === true || (options && options.isPtr);
        const skipIndexes = options && typeof options === 'object' && options.skipIndexes;
        if (!isPtr && this.db._guardWrite) this.db._guardWrite(this._lockPath(key), value, 'set');`
);
s = s.replace(
`        if (!isPtr && this.db.turbo && this.db.turbo.captureSet(this.handle, key, value)) {
            if (this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return value;
        }`,
`        if (!isPtr && this.db.turbo && this.db.turbo.captureSet(this.handle, key, value)) {
            if (!skipIndexes && this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return value;
        }`
);
s = s.replace(
`            const out = this._getScribe().set(key, value, options);
            if (!isPtr && this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return out;`,
`            const out = this._getScribe().set(key, value, options);
            if (!isPtr && !skipIndexes && this.db.indexes) this.db.indexes.afterWrite(this._lockPath(key));
            return out;`
);
fs.writeFileSync(p, s);
console.log('patched writer skipIndexes');
