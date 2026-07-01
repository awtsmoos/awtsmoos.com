// B"H
/**
 * @file chesed.js
 * @chapter The Allocator Remembers Every Hollow Vessel
 * @description
 * Sequential byte allocator for AwtsmoosDB. Modern vessels store an 8-byte
 * cursor at byte 0. Some production vessels are older: byte 0 begins the root
 * manifest itself, not a superblock. If those first bytes are read as a cursor,
 * the letters of creation become a monstrous impossible offset.
 *
 * This allocator therefore detects impossible superblock cursors. In that case
 * it enters legacy-superblockless mode: allocations append at physical EOF, and
 * flushCursor() refuses to overwrite byte 0. The ancient root stays untouched.
 *
 * The reclaimed-space covenant is also sealed here. When reuseFreedSpace is
 * true or "verified", old byte ranges are returned to the free-list, coalesced,
 * persisted through the existing free-list seal, and searched before the file
 * grows. The format remains the same; only the mercy becomes consistent.
 */
class AllocatorChesed {
  constructor(pager) {
    this.pager = pager;
    this.db = pager.db;
    this.cursor = 0;
    this.freeList = [];
    this.legacySuperblockless = false;
    this._savingFreeList = false;
  }

  init() {
    const physicalSize = this.physicalSize();
    const header = this.pager.readExact(0, 8);
    if (!header || header.length !== 8) {
      this.cursor = 64;
      this.flushCursor();
      return;
    }

    const readCursor = Number(header.readBigUInt64BE(0));
    if (this.isImpossibleCursor(readCursor, physicalSize)) {
      this.legacySuperblockless = true;
      this.cursor = Math.max(physicalSize, 0);
      return;
    }

    this.cursor = readCursor;
    if (!Number.isFinite(this.cursor) || this.cursor < 64) this.cursor = 64;
  }

  physicalSize() {
    const size = Number(this.pager.currentFileSize || 0);
    return Number.isFinite(size) && size >= 0 ? size : 0;
  }

  isImpossibleCursor(cursor, physicalSize) {
    if (!Number.isSafeInteger(cursor)) return true;
    if (cursor < 64) return false;
    if (physicalSize <= 0) return false;
    const saneGrowthLimit = Math.max(physicalSize + 1024 * 1024 * 1024, physicalSize * 4);
    return cursor > saneGrowthLimit;
  }

  repairLegacyCursorBeforeWrite() {
    if (!this.legacySuperblockless) return;
    const size = this.physicalSize();
    if (this.isImpossibleCursor(this.cursor, size) || this.cursor < size) this.cursor = size;
  }

  allocate(size) {
    if (this.cursor === 0) this.init();
    this.repairLegacyCursorBeforeWrite();
    if (size <= 0) return { offset: 0, length: 0 };

    if (this.canReuseFreeSpace()) {
      this.mergeFreeList();
      this.freeList.sort((a, b) => (a.length - b.length) || (a.offset - b.offset));
      for (let i = 0; i < this.freeList.length; i++) {
        const gap = this.freeList[i];
        if (gap.length < size) continue;
        const loc = { offset: gap.offset, length: size };
        gap.offset += size;
        gap.length -= size;
        if (gap.length === 0) this.freeList.splice(i, 1);
        this.freeList.sort((a, b) => a.offset - b.offset);
        this.persistFreeListSoon();
        return loc;
      }
      this.freeList.sort((a, b) => a.offset - b.offset);
    }

    const offset = this.cursor;
    this.cursor += size;
    return { offset, length: size };
  }

  free(offset, length) {
    if (this.cursor === 0) this.init();
    if (!Number.isFinite(offset) || !Number.isFinite(length) || length <= 0) return;
    if (offset < 64) return;
    if (offset + length > this.cursor) return;

    if (offset + length === this.cursor) {
      this.cursor = offset;
      this.absorbTrailingGaps();
      this.flushCursor();
      this.persistFreeListSoon();
      return;
    }

    this.freeList.push({ offset, length });
    this.mergeFreeList();
    this.persistFreeListSoon();
  }

  releasePointer(ptr) {
    if (!this.canReuseFreeSpace() || !ptr) return;
    const Pointer = require('../../utils/pointer/crown.js');
    const constants = require('../../constants.js');
    const dec = Buffer.isBuffer(ptr) ? Pointer.decode(ptr) : ptr;
    if (!dec || dec.type === constants.VAL_TYPE.ANCHOR) return;
    this.free(dec.offset, dec.length);
  }

  canReuseFreeSpace() {
    const mode = this.db?.options?.reuseFreedSpace;
    return mode === true || mode === 'verified';
  }

  persistFreeListSoon() {
    if (this._savingFreeList) return;
    if (this.legacySuperblockless) return;
    if (!this.db || this.db.options?.readOnly) return;
    if (typeof this.db._saveFreeListSeal !== 'function') return;
    this._savingFreeList = true;
    try {
      this.db._saveFreeListSeal();
    } finally {
      this._savingFreeList = false;
    }
  }

  mergeFreeList() {
    if (this.freeList.length < 2) return;
    this.freeList.sort((a, b) => a.offset - b.offset);
    const merged = [this.freeList[0]];
    for (let i = 1; i < this.freeList.length; i++) {
      const last = merged[merged.length - 1];
      const gap = this.freeList[i];
      if (last.offset + last.length >= gap.offset) {
        last.length = Math.max(last.offset + last.length, gap.offset + gap.length) - last.offset;
      } else {
        merged.push(gap);
      }
    }
    this.freeList = merged;
  }

  absorbTrailingGaps() {
    let changed = true;
    while (changed) {
      changed = false;
      this.mergeFreeList();
      for (let i = 0; i < this.freeList.length; i++) {
        const gap = this.freeList[i];
        if (gap.offset + gap.length !== this.cursor) continue;
        this.cursor = gap.offset;
        this.freeList.splice(i, 1);
        changed = true;
        break;
      }
    }
  }

  _mergeFreeList() {
    return this.mergeFreeList();
  }

  _absorbTrailingGaps() {
    return this.absorbTrailingGaps();
  }

  save(val) {
    if (!this.db.primitiveSaver) throw new Error('B"H Fatal: Primitive Scribe not manifested. Cannot preserve truth.');
    return this.db.primitiveSaver.save(val);
  }

  flushCursor() {
    if (this.legacySuperblockless) return;
    if (this.cursor < 64) return;
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64BE(BigInt(this.cursor), 0);
    this.pager.writeExact(0, buf);
  }
}

module.exports = AllocatorChesed;
