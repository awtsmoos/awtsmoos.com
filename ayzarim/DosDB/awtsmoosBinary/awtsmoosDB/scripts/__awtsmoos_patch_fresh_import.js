// B"H
const fs = require('fs');

function patch(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error('No change made to ' + file);
  fs.writeFileSync(file, after);
  console.log('patched ' + file);
}

patch('api/dosdb/index.js', s => {
  s = s.replace("const path = require('path');\n", "const path = require('path');\nconst constants = require('../../constants.js');\n");
  s = s.replace(
`    slot.parent[slot.key] = value;

    if (options.cacheParents !== false) {`,
`    const directOptions = this._directWriteOptions(options);
    const wroteDirect = this._writeDirect(slot.parent, slot.key, value, directOptions);
    if (!wroteDirect) slot.parent[slot.key] = value;

    if (options.cacheParents !== false) {`
  );
  s = s.replace(
`  /**
   * @method clearCache`,
`  /**
   * @method _directWriteOptions
   * @private
   * @description Extracts fast-write options that must reach the LiveHandle writer.
   * @param {object} options - Public write options.
   * @returns {object|null} Writer options or null.
   */
  _directWriteOptions(options = {}) {
    if (!options.assumeNew && !options.skipFree && !options.skipIndexes && !options.skipOldState) return null;
    return {
      assumeNew: !!options.assumeNew,
      skipFree: !!options.skipFree,
      skipIndexes: !!options.skipIndexes,
      skipOldState: !!options.skipOldState
    };
  }

  /**
   * @method _writeDirect
   * @private
   * @description Calls a parent LiveHandle writer directly so import-only flags are preserved.
   * @param {object} parent - Parent LiveHandle.
   * @param {string} key - Child key.
   * @param {*} value - Value to write.
   * @param {object|null} directOptions - Writer options.
   * @returns {boolean} True when direct writer accepted the operation.
   */
  _writeDirect(parent, key, value, directOptions) {
    if (!directOptions) return false;
    const soul = parent && parent[constants.SYMBOLS.INTERNALS];
    if (!soul || !soul.writer || typeof soul.writer.set !== 'function') return false;
    soul.writer.set(key, value, directOptions);
    return true;
  }

  /**
   * @method clearCache`
  );
  return s;
});

patch('api/liveHandle/writer/map_ops/setter.js', s => {
  s = s.replace(
`        const isPtr    = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;`,
`        const isPtr    = (options === true) || (options && options.isPtr);
        const skipFree = (options && typeof options === 'object' && options.skipFree) || false;
        const assumeNew = (options && typeof options === 'object' && options.assumeNew) || false;
        const skipIndexes = (options && typeof options === 'object' && options.skipIndexes) || false;
        const skipOldState = assumeNew || (options && typeof options === 'object' && options.skipOldState) || false;`
  );
  s = s.replace(
`        const searchIndexed = this.common.getSearchIndex(path);
        const vectorIndex   = this.common.getVectorIndex(path);`,
`        const searchIndexed = !skipIndexes && this.common.getSearchIndex(path);
        const vectorIndex   = !skipIndexes && this.common.getVectorIndex(path);`
  );
  s = s.replace(
`        // 5. Capture old state for index cleanup
        const { oldPtr, oldVal } = MapIndexer.captureOldState(
            engine, encodedKey, this.common, this.handle, searchIndexed, vectorIndex
        );

        // 6. Perform the physical inscription
        engine.set(encodedKey, valToSet, { isPtr: true, skipFree });

        if (oldPtr && !skipFree && !searchIndexed && !vectorIndex) {
            this.db.allocator.releasePointer(oldPtr);
        }

        // 7. Update anchor + handle pointer to reflect possible relocation
        this.common.checkAutoCompact(engine, effectiveType);

        // 8. Broadcast to global indices
        MapIndexer.processSet(
            this.db, path, key, valToSet, value,
            oldPtr, oldVal, searchIndexed, vectorIndex, this.common
        );`,
`        // 5. Capture old state for overwrite/index cleanup only when needed.
        let oldPtr = null;
        let oldVal = null;
        if (!skipOldState) {
            const prior = MapIndexer.captureOldState(
                engine, encodedKey, this.common, this.handle, searchIndexed, vectorIndex
            );
            oldPtr = prior.oldPtr;
            oldVal = prior.oldVal;
        }

        // 6. Perform the physical inscription
        engine.set(encodedKey, valToSet, { isPtr: true, skipFree, assumeNew });

        if (oldPtr && !assumeNew && !skipFree && !searchIndexed && !vectorIndex) {
            this.db.allocator.releasePointer(oldPtr);
        }

        // 7. Update anchor + handle pointer to reflect possible relocation
        this.common.checkAutoCompact(engine, effectiveType);

        // 8. Broadcast to global indices unless caller explicitly skipped them.
        if (!skipIndexes) {
            MapIndexer.processSet(
                this.db, path, key, valToSet, value,
                oldPtr, oldVal, searchIndexed, vectorIndex, this.common
            );
        }`
  );
  return s;
});

patch('structure/dictionary/logic/inscriber.js', s => {
  s = s.replace(
`    const exists = engine.map.getPtr(mapKey);
    const newMS = engine.map.set(mapKey, valPtr, options);`,
`    const assumeNew = options && options.assumeNew === true;
    const exists = assumeNew ? null : engine.map.getPtr(mapKey);
    const newMS = engine.map.set(mapKey, valPtr, options);`
  );
  return s;
});

patch('scripts/migrate_dayuh_chadash_full.js', s => {
  s = s.replace(
`        db.DosDB.write(storeId, imported.value, { rootKey: ROOT_KEY, cacheParents });`,
`        db.DosDB.write(storeId, imported.value, {
          rootKey: ROOT_KEY,
          cacheParents,
          assumeNew: true,
          skipFree: true,
          skipIndexes: true,
          skipOldState: true
        });`
  );
  s = s.replace(
`    db.DosDB.write(dirs[i], {}, { rootKey: ROOT_KEY, cacheParents });`,
`    db.DosDB.write(dirs[i], {}, {
      rootKey: ROOT_KEY,
      cacheParents,
      assumeNew: true,
      skipFree: true,
      skipIndexes: true,
      skipOldState: true
    });`
  );
  return s;
});
