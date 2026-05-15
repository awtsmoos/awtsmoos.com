// B"H
const fs = require('fs');

function patch(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error('No change made to ' + file);
  fs.writeFileSync(file, after);
  console.log('patched ' + file);
}

patch('structure/map/index.js', s => {
  if (s.includes('bulkLoadSorted(entries')) return s;
  return s.replace(
`    set(key, valPtr) {
        if (!this.ptr) this.create();
        const root = this.nodeIO.load(this.ptr);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        
        const res = this.insertOps.perform(root, keyBuf, valPtr);
        this.ptr = SmartPointer.decode(res.newSeal);
        return res.newSeal;
    }
`,
`    set(key, valPtr) {
        if (!this.ptr) this.create();
        const root = this.nodeIO.load(this.ptr);
        const keyBuf = Buffer.isBuffer(key) ? key : Buffer.from(String(key), 'utf8');
        
        const res = this.insertOps.perform(root, keyBuf, valPtr);
        this.ptr = SmartPointer.decode(res.newSeal);
        return res.newSeal;
    }

    /**
     * @method bulkLoadSorted
     * @description
     * Builds a B-tree from sorted unique entries in one bottom-up pass. This is
     * for fresh/import workloads and is bounded by the caller's current entry
     * group, not the whole database.
     *
     * @param {Array<{key:Buffer|string,value:Buffer}>} entries - Sorted entries.
     * @param {object} [options] - Builder options.
     * @returns {Buffer} Root map seal.
     */
    bulkLoadSorted(entries, options = {}) {
        const maxKeys = Math.max(8, Number(options.maxKeys || 200));
        const prepared = Array.from(entries || []).map(entry => ({
            key: Buffer.isBuffer(entry.key) ? entry.key : Buffer.from(String(entry.key), 'utf8'),
            value: SmartPointer.toBuffer(entry.value)
        }));

        if (prepared.length === 0) return this.create();

        const leaves = [];
        for (let i = 0; i < prepared.length; i += maxKeys) {
            const group = prepared.slice(i, i + maxKeys);
            const node = {
                isLeaf: true,
                keys: group.map(entry => entry.key),
                values: group.map(entry => entry.value)
            };
            leaves.push({ firstKey: group[0].key, seal: this.nodeIO.save(node) });
        }

        let level = leaves;
        while (level.length > 1) {
            const next = [];
            const maxChildren = maxKeys + 1;
            for (let i = 0; i < level.length; i += maxChildren) {
                const children = level.slice(i, i + maxChildren);
                const node = {
                    isLeaf: false,
                    keys: children.slice(1).map(child => child.firstKey),
                    children: children.map(child => child.seal)
                };
                next.push({ firstKey: children[0].firstKey, seal: this.nodeIO.save(node) });
            }
            level = next;
        }

        this.ptr = SmartPointer.decode(level[0].seal);
        return level[0].seal;
    }
`
  );
});

patch('structure/sequence/index.js', s => {
  if (s.includes('bulkLoadPointers(values')) return s;
  return s.replace(
`  /**
   * @method splice`,
`  /**
   * @method bulkLoadPointers
   * @description
   * Builds a leaf sequence from already-saved pointer seals without repeated
   * root rewrites. Intended for fresh import/build paths.
   *
   * @param {Array<Buffer>} values - Pointer seals in desired order.
   * @returns {Buffer} Updated sequence seal.
   */
  bulkLoadPointers(values) {
    const items = Array.from(values || []).map(value => ({
      ptr: SmartPointer.toBuffer(value),
      count: 1
    }));

    const root = this.nodeIO.create(true);
    root.items = items;
    root.totalCount = items.length;

    const pLoc = this.nodeIO.save(root);
    this.ptr = {
      ...pLoc,
      type: constants.VAL_TYPE.SEQUENCE
    };

    return SmartPointer.toBuffer(this.ptr);
  }

  /**
   * @method splice`
  );
});

patch('structure/dictionary/index.js', s => {
  if (s.includes('bulkLoadEntries(entries')) return s;
  return s.replace(
`    set(key, valPtr, options = {}) {
        this._init();
        if (!this.initialized) this.create();
        
        const Inscriber = require('./logic/inscriber.js');
        const pLoc = Inscriber.set(this, key, valPtr, options);
        this.ptr = pLoc;
        return SmartPointer.toBuffer(pLoc);
    }
`,
`    set(key, valPtr, options = {}) {
        this._init();
        if (!this.initialized) this.create();
        
        const Inscriber = require('./logic/inscriber.js');
        const pLoc = Inscriber.set(this, key, valPtr, options);
        this.ptr = pLoc;
        return SmartPointer.toBuffer(pLoc);
    }

    /**
     * @method bulkLoadEntries
     * @description
     * Builds a dictionary from fresh entries in one pass: map once, sequence
     * once, wrapper once. The caller controls the entry group size.
     *
     * @param {Array<{key:string|Buffer,value:Buffer}>} entries - Dictionary entries.
     * @param {object} [options] - Builder options.
     * @returns {Buffer} Dictionary seal.
     */
    bulkLoadEntries(entries, options = {}) {
        const MapEngine = require('../map/index.js');
        const SequenceEngine = require('../sequence/index.js');
        const toKeyText = require('./logic/keyText.js');
        const toKeyBytes = require('./logic/keyBytes.js');

        const prepared = Array.from(entries || []).map(entry => {
            const text = toKeyText(entry.key);
            return {
                text,
                mapKey: toKeyBytes(text),
                value: SmartPointer.toBuffer(entry.value)
            };
        });

        const map = new MapEngine(this.allocator);
        const seq = new SequenceEngine(this.allocator);
        const sorted = prepared.slice().sort((a, b) => a.mapKey.compare(b.mapKey));
        const mapSeal = map.bulkLoadSorted(sorted.map(entry => ({ key: entry.mapKey, value: entry.value })), options.map || options);
        const orderPointers = prepared.map(entry => this.allocator.save(entry.text));
        const seqSeal = seq.bulkLoadPointers(orderPointers);

        const total = 4 + 1 + mapSeal.length + 1 + seqSeal.length;
        const loc = this.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total).fill(0);
        buf.write(constants.MAGIC_DIC, 0);
        let p = 4;
        buf.writeUInt8(mapSeal.length, p++);
        mapSeal.copy(buf, p);
        p += mapSeal.length;
        buf.writeUInt8(seqSeal.length, p++);
        seqSeal.copy(buf, p);
        this.db._writeChainSafe(loc, buf);

        this.map = map;
        this.seq = seq;
        this.initialized = true;
        this.ptr = { ...loc, type: constants.VAL_TYPE.DICTIONARY };
        return SmartPointer.toBuffer(this.ptr);
    }
`
  );
});
