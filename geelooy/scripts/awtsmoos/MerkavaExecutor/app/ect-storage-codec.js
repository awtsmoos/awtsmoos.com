// B"H
(function ectStorageCodec(root) {
  const base = root.AwtsEctCompiler;
  const TIER_BYTES = [
    172, 117, 118, 116, 16, 32, 64, 80, 96, 128, 192, 225, 226, 227, 228, 229,
    21, 33, 35, 43, 75, 89, 93, 110, 117, 137, 152, 177, 184, 193, 194, 204,
    217, 219, 225, 233, 246, 253, 91, 126, 54, 77, 71, 102, 166, 186, 237, 98,
    6, 8, 9, 10, 11, 12, 13, 14, 15, 24, 28, 29, 30, 31, 40, 48
  ];

  /**
   * B"H. Universal storage forge.
   *
   * Storage chooses the smallest honest vessel: bare semantic RAM, static-tier
   * semantic entropy, LZ bitpack, or learned n-gram dictionary. Preservation
   * options live above this layer; here every byte must decode exactly back to
   * the semantic RAM image.
   */
  function installStorageCodec() {
    if (!base || base.storageWrapped) return;
    const originalCompile = base.compileProject;
    base.compileProject = function compileWithStorage(project, Parser, options) {
      const result = originalCompile(project, Parser, options);
      const semantic = Array.isArray(result.bytes) ? result.bytes.slice() : [];
      const storage = bestStorage(semantic);
      const ram = buildRamImage(semantic);
      result.semanticBytes = semantic;
      result.storage = storage;
      result.ramImage = ram.summary;
      result.bytes = storage.preview;
      result.byteCount = storage.byteCount;
      result.bitLength = storage.bitLength;
      result.metrics.semanticRamBytes = semantic.length;
      result.metrics.storageBytes = storage.byteCount;
      result.metrics.storageBits = storage.bitLength;
      result.metrics.ramBytes = ram.totalBytes;
      result.metrics.compressionX = round(result.metrics.originalSourceBytes / Math.max(1, storage.byteCount));
      result.metrics.mode = result.metrics.mode + " + best-storage-tier-ngram-lz";
      result.metrics.detail.storage = storage.detail;
      result.metrics.detail.ram = ram.summary;
      return result;
    };
    base.storageWrapped = true;
    base.encodeStorage = bestStorage;
    base.decodeStorage = decodeStorage;
    base.buildRamImage = buildRamImage;
  }

  function bestStorage(bytes) {
    const choices = [bareStorage(bytes), tierStorage(bytes), lzStorage(bytes), ngramStorage(bytes)];
    let best = choices[0];
    for (let index = 1; index < choices.length; index += 1) if (choices[index].byteCount < best.byteCount) best = choices[index];
    return best;
  }

  function bareStorage(bytes) {
    const copy = bytes.slice();
    return {
      magic: "AWTS-RAM-BARE",
      version: 4,
      byteCount: copy.length,
      bitLength: copy.length * 8,
      preview: copy.slice(0, 512),
      bytes: copy,
      detail: { mode: "bare", rawSemanticBytes: bytes.length, storageSavedBytes: 0, neverInflatesRaw: true }
    };
  }

  /** B"H. Static semantic entropy: no table overhead, exact decode. */
  function tierStorage(bytes) {
    const writer = new BitWriter();
    writer.write(0xE6, 8);
    writer.write(1, 4);
    writer.tiny(bytes.length);
    let tiny = 0, tier = 0, raw = 0;
    for (let index = 0; index < bytes.length; index += 1) {
      const value = bytes[index];
      if (value < 16) {
        writer.write(0, 2);
        writer.write(value, 4);
        tiny += 1;
      } else {
        const id = TIER_BYTES.indexOf(value);
        if (id >= 0 && id < 64) {
          writer.write(2, 2);
          writer.write(id, 6);
          tier += 1;
        } else {
          writer.write(3, 2);
          writer.write(value, 8);
          raw += 1;
        }
      }
    }
    return packageBits("AWTS-STATIC-TIER-STORAGE", bytes.length, writer, { mode: "static-tier", rawSemanticBytes: bytes.length, tiny, tier, raw });
  }

  function lzStorage(bytes) {
    const tokens = lzTokens(bytes);
    const writer = new BitWriter();
    writer.write(0xE7, 8);
    writer.write(2, 4);
    writer.tiny(bytes.length);
    writer.tiny(tokens.length);
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token.kind === 0) { writer.write(0, 1); writer.write(token.value, 8); }
      else { writer.write(1, 1); writer.tiny(token.length - 3); writer.tiny(token.distance - 1); }
    }
    return packageBits("AWTS-LZ-BIT-STORAGE", bytes.length, writer, { mode: "lz", rawSemanticBytes: bytes.length, tokenCount: tokens.length, backrefs: countKind(tokens, 1), literals: countKind(tokens, 0) });
  }

  function ngramStorage(bytes) {
    const dict = buildDictionary(bytes);
    if (!dict.length) return impossibleStorage(bytes.length, "ngram-empty");
    const tokens = dictionaryTokens(bytes, dict);
    const writer = new BitWriter();
    writer.write(0xE9, 8);
    writer.write(1, 4);
    writer.tiny(bytes.length);
    writer.tiny(dict.length);
    for (let index = 0; index < dict.length; index += 1) {
      writer.tiny(dict[index].length);
      for (let item = 0; item < dict[index].length; item += 1) writer.write(dict[index][item], 8);
    }
    writer.tiny(tokens.length);
    for (let index = 0; index < tokens.length; index += 1) {
      const token = tokens[index];
      if (token.kind === 0) { writer.write(0, 1); writer.write(token.value, 8); }
      else { writer.write(1, 1); writer.tiny(token.id); }
    }
    return packageBits("AWTS-NGRAM-BIT-STORAGE", bytes.length, writer, { mode: "ngram", rawSemanticBytes: bytes.length, dictionaryEntries: dict.length, tokenCount: tokens.length, calls: countKind(tokens, 1), literals: countKind(tokens, 0) });
  }

  function packageBits(magic, rawLength, writer, detail) {
    const packed = writer.bytes;
    return { magic, version: 4, byteCount: packed.length, bitLength: writer.bitLength, preview: packed.slice(0, 512), bytes: packed, detail: Object.assign({}, detail, { storageSavedBytes: rawLength - packed.length }) };
  }

  function impossibleStorage(rawLength, mode) {
    return { magic: "AWTS-IMPOSSIBLE", version: 4, byteCount: Number.MAX_SAFE_INTEGER, bitLength: 0, preview: [], bytes: [], detail: { mode, rawSemanticBytes: rawLength, storageSavedBytes: -Infinity } };
  }

  function decodeStorage(pack) {
    const bytes = pack.bytes || pack.preview || [];
    if (pack.magic === "AWTS-RAM-BARE") return bytes.slice();
    if (pack.magic === "AWTS-STATIC-TIER-STORAGE") return decodeTier(bytes);
    if (pack.magic === "AWTS-LZ-BIT-STORAGE") return decodeLz(bytes);
    if (pack.magic === "AWTS-NGRAM-BIT-STORAGE") return decodeNgram(bytes);
    return bytes.slice();
  }

  function decodeTier(bytes) {
    const reader = new BitReader(bytes);
    if (reader.read(8) !== 0xE6) return bytes.slice();
    reader.read(4);
    const outputLength = reader.tiny();
    const out = [];
    while (out.length < outputLength) {
      const kind = reader.read(2);
      if (kind === 0) out.push(reader.read(4));
      else if (kind === 2) out.push(TIER_BYTES[reader.read(6)] || 0);
      else out.push(reader.read(8));
    }
    return out;
  }

  function decodeLz(bytes) {
    const reader = new BitReader(bytes);
    if (reader.read(8) !== 0xE7) return bytes.slice();
    reader.read(4);
    const outputLength = reader.tiny();
    const tokenCount = reader.tiny();
    const out = [];
    for (let index = 0; index < tokenCount; index += 1) {
      if (reader.read(1) === 0) out.push(reader.read(8));
      else {
        const length = reader.tiny() + 3;
        const distance = reader.tiny() + 1;
        for (let item = 0; item < length; item += 1) out.push(out[out.length - distance]);
      }
    }
    return out.slice(0, outputLength);
  }

  function decodeNgram(bytes) {
    const reader = new BitReader(bytes);
    if (reader.read(8) !== 0xE9) return bytes.slice();
    reader.read(4);
    const outputLength = reader.tiny();
    const dictCount = reader.tiny();
    const dict = [];
    for (let index = 0; index < dictCount; index += 1) {
      const length = reader.tiny();
      const entry = [];
      for (let item = 0; item < length; item += 1) entry.push(reader.read(8));
      dict.push(entry);
    }
    const tokenCount = reader.tiny();
    const out = [];
    for (let index = 0; index < tokenCount; index += 1) {
      if (reader.read(1) === 0) out.push(reader.read(8));
      else {
        const entry = dict[reader.tiny()] || [];
        for (let item = 0; item < entry.length; item += 1) out.push(entry[item]);
      }
    }
    return out.slice(0, outputLength);
  }

  function buildRamImage(bytes) {
    const stream = new Uint8Array(bytes);
    const sections = new Uint16Array([0, stream.length]);
    const total = stream.length + sections.byteLength;
    return {
      stream,
      sections,
      totalBytes: total,
      summary: {
        streamBytes: stream.length,
        sectionBytes: sections.byteLength,
        totalBytes: total,
        typedArraysOnly: true,
        mode: "compact-single-stream-ram"
      }
    };
  }

  function buildDictionary(bytes) {
    const stats = Object.create(null);
    for (let size = 3; size <= 12; size += 1) for (let index = 0; index + size <= bytes.length; index += 1) {
      const key = keyOf(bytes, index, size);
      if (!stats[key]) stats[key] = { bytes: bytes.slice(index, index + size), count: 0, score: 0 };
      stats[key].count += 1;
    }
    const candidates = Object.keys(stats).map(key => {
      const item = stats[key];
      item.score = (item.bytes.length - 1) * (item.count - 1) - item.bytes.length;
      return item;
    }).filter(item => item.count > 1 && item.score > 2);
    candidates.sort((a, b) => b.score - a.score || b.bytes.length - a.bytes.length);
    return nonOverlapping(candidates).slice(0, 31).map(item => item.bytes);
  }

  function nonOverlapping(candidates) {
    const out = [];
    const used = Object.create(null);
    for (let index = 0; index < candidates.length; index += 1) {
      const key = candidates[index].bytes.join(",");
      if (used[key]) continue;
      used[key] = true;
      out.push(candidates[index]);
      if (out.length >= 31) break;
    }
    return out;
  }

  function dictionaryTokens(bytes, dict) {
    const tokens = [];
    let index = 0;
    while (index < bytes.length) {
      const match = dictionaryMatch(bytes, index, dict);
      if (match.id >= 0) { tokens.push({ kind: 1, id: match.id }); index += dict[match.id].length; }
      else { tokens.push({ kind: 0, value: bytes[index] }); index += 1; }
    }
    return tokens;
  }

  function dictionaryMatch(bytes, index, dict) {
    let bestId = -1;
    let bestLength = 0;
    for (let id = 0; id < dict.length; id += 1) {
      const entry = dict[id];
      if (entry.length <= bestLength) continue;
      if (matchesAt(bytes, index, entry)) { bestId = id; bestLength = entry.length; }
    }
    return { id: bestId, length: bestLength };
  }

  function lzTokens(bytes) {
    const tokens = [];
    let index = 0;
    while (index < bytes.length) {
      const match = bestMatch(bytes, index);
      if (match.length >= 4) { tokens.push({ kind: 1, distance: match.distance, length: match.length }); index += match.length; }
      else { tokens.push({ kind: 0, value: bytes[index] }); index += 1; }
    }
    return tokens;
  }

  function bestMatch(bytes, index) {
    let bestLength = 0;
    let bestDistance = 0;
    const maxDistance = Math.min(index, 4096);
    for (let distance = 1; distance <= maxDistance; distance += 1) {
      let length = 0;
      while (length < 66 && index + length < bytes.length && bytes[index + length] === bytes[index + length - distance]) length += 1;
      if (length > bestLength) { bestLength = length; bestDistance = distance; }
    }
    return { length: bestLength, distance: bestDistance };
  }

  class BitWriter {
    constructor() { this.bytes = []; this.bitLength = 0; }
    bit(value) { const index = this.bitLength >> 3; const shift = 7 - (this.bitLength & 7); this.bytes[index] = this.bytes[index] || 0; this.bytes[index] |= (value & 1) << shift; this.bitLength += 1; }
    write(value, width) { for (let bit = width - 1; bit >= 0; bit -= 1) this.bit((value >> bit) & 1); }
    tiny(value) { if (value < 8) { this.write(0, 1); this.write(value, 3); } else if (value < 64) { this.write(2, 2); this.write(value, 6); } else { this.write(3, 2); this.write(value, 14); } }
  }

  class BitReader {
    constructor(bytes) { this.bytes = bytes; this.bitLength = 0; }
    read(width) { let out = 0; for (let bit = 0; bit < width; bit += 1) { const index = this.bitLength >> 3; const shift = 7 - (this.bitLength & 7); out = (out << 1) | ((this.bytes[index] >> shift) & 1); this.bitLength += 1; } return out; }
    tiny() { if (this.read(1) === 0) return this.read(3); if (this.read(1) === 0) return this.read(6); return this.read(14); }
  }

  function keyOf(bytes, index, size) { let out = ""; for (let item = 0; item < size; item += 1) out += bytes[index + item] + ","; return out; }
  function matchesAt(bytes, index, entry) { if (index + entry.length > bytes.length) return false; for (let item = 0; item < entry.length; item += 1) if (bytes[index + item] !== entry[item]) return false; return true; }
  function unique(bytes) { const seen = Object.create(null), out = []; for (let index = 0; index < bytes.length; index += 1) if (!seen[bytes[index]]) { seen[bytes[index]] = true; out.push(bytes[index]); } return out; }
  function countKind(tokens, kind) { let count = 0; for (let index = 0; index < tokens.length; index += 1) if (tokens[index].kind === kind) count += 1; return count; }
  function round(value) { return Math.round(value * 100) / 100; }

  installStorageCodec();
})(typeof self !== "undefined" ? self : globalThis);
