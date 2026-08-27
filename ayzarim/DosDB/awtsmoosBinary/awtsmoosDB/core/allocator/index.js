// B"H
/**
 * @file index.js
 * @chapter Exact Byte Chesed Learns Not To Crush The Ancient Root
 * @description
 * Exact byte allocator used by the live AwtsmoosDB writer. Modern files keep
 * an 8-byte cursor at byte 0. Legacy superblockless files begin immediately
 * with root-manifest data. If those first bytes are treated as a cursor, the
 * writer seeks to an impossible offset and reality screams ERR_OUT_OF_RANGE.
 *
 * The repair is narrow: impossible cursor => legacySuperblockless mode.
 * In that mode allocation appends at physical EOF and never writes byte 0.
 */
class ExactByteAllocator {
  constructor(pager, db) {
    this.pager = pager;
    this.db = db;
    this.cursor = 0;
    this.legacySuperblockless = false;
    this.freeBitmap = 0;
    this.freeBuckets = new Array(32).fill(null);
  }

  init() {
    this.pager.init();
    const size = this.physicalSize();
    if (size === 0) {
      this.cursor = 64;
      this.writeSuperblockCursor();
      return;
    }

    const sb = this.pager.readExact(0, 64);
    const readCursor = sb && sb.length >= 8 ? Number(sb.readBigUInt64BE(0)) : 0;
    if (this.isImpossibleCursor(readCursor, size)) {
      this.legacySuperblockless = true;
      this.cursor = size;
      return;
    }

    this.cursor = readCursor;
    if (!Number.isFinite(this.cursor) || this.cursor < 64) {
      this.cursor = 64;
      this.writeSuperblockCursor();
    }
  }

  physicalSize() {
    const size = Number(this.pager.currentFileSize || this.pager.fileSize || 0);
    return Number.isFinite(size) && size >= 0 ? size : 0;
  }

  isImpossibleCursor(cursor, physicalSize) {
    if (!Number.isSafeInteger(cursor)) return true;
    if (cursor < 64) return false;
    if (physicalSize <= 0) return false;
    const saneGrowthLimit = Math.max(physicalSize + 1024 * 1024 * 1024, physicalSize * 4);
    return cursor > saneGrowthLimit;
  }

  writeSuperblockCursor() {
    if (this.legacySuperblockless) return;
    const cursorBuf = Buffer.allocUnsafe(8);
    cursorBuf.writeBigUInt64BE(BigInt(this.cursor), 0);
    this.pager.writeExact(0, cursorBuf);
  }

  allocate(sizeBytes) {
    if (this.cursor === 0) this.init();
    if (sizeBytes === 0) return { offset: 0, length: 0 };

    const reused = this.tryReuse(sizeBytes);
    if (reused) return reused;

    const finalOffset = this.cursor;
    this.cursor += sizeBytes;
    this.writeSuperblockCursor();
    return { offset: finalOffset, length: sizeBytes };
  }

  tryReuse(sizeBytes) {
    const bucketIdx = 31 - Math.clz32(sizeBytes);
    const mask = ~((1 << bucketIdx) - 1);
    const availableBits = this.freeBitmap & mask;
    if (availableBits === 0) return null;

    const bestBucket = 31 - Math.clz32(availableBits & -availableBits);
    const bucketList = this.freeBuckets[bestBucket];
    if (!bucketList) return null;

    for (let i = 0; i < bucketList.length; i++) {
      if (bucketList[i].size < sizeBytes) continue;
      const seg = bucketList.splice(i, 1)[0];
      if (bucketList.length === 0) this.freeBitmap &= ~(1 << bestBucket);
      const leftover = seg.size - sizeBytes;
      if (leftover > 0) this.free(seg.offset + sizeBytes, leftover);
      return { offset: seg.offset, length: sizeBytes };
    }
    return null;
  }

  free(offset, sizeBytes) {
    if (sizeBytes === 0) return;
    const bucketIdx = 31 - Math.clz32(sizeBytes);
    if (!this.freeBuckets[bucketIdx]) this.freeBuckets[bucketIdx] = [];
    this.freeBuckets[bucketIdx].push({ offset, size: sizeBytes });
    this.freeBitmap |= (1 << bucketIdx);

    const freeMark = Buffer.allocUnsafe(1);
    freeMark[0] = 0xFF;
    this.pager.writeExact(offset, freeMark);
  }
}

module.exports = ExactByteAllocator;
