// B"H
(function ectStorageCodec(root) {
  const base = root.AwtsEctCompiler;

  /**
   * B"H. Universal storage forge.
   *
   * No app-specific spell lives here. The codec studies the semantic RAM bytes
   * created from arbitrary HTML/CSS/JS and chooses the smallest honest vessel:
   * bare RAM, LZ bitpack, or learned n-gram dictionary bitpack. RAM remains a
   * separate typed-array image for execution; storage remains the sleeping seed.
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
      result.metrics.mode = result.metrics.mode + " + universal-storage-ngram-lz";
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
    const choices = [bareStorage(bytes), lzStorage(bytes), ngramStorage(bytes)];
    let best = choices[0];
    for (let i = 1; i < choices.length; i += 1) if (choices[i].byteCount < best.byteCount) best = choices[i];
    return best;
  }

  function bareStorage(bytes) {
    const copy = bytes.slice();
    return {
      magic: "AWTS-RAM-BARE",
      version: 3,
      byteCount: copy.length,
      bitLength: copy.length * 8,
      preview: copy.slice(0, 512),
      bytes: copy,
      detail: { mode: "bare", rawSemanticBytes: bytes.length, storageSavedBytes: 0, neverInflatesRaw: true }
    };
  }

  function lzStorage(bytes) {
    const tokens = lzTokens(bytes);
    const writer = new BitWriter();
    writer.write(0xE7, 8);
    writer.write(2, 4);
    writer.tiny(bytes.length);
    writer.tiny(tokens.length);
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token.kind === 0) {
        writer.write(0, 1);
        writer.write(token.value, 8);
      } else {
        writer.write(1, 1);
        writer.tiny(token.length - 3);
        writer.tiny(token.distance - 1);
      }
    }
    return packageBits("AWTS-LZ-BIT-STORAGE", bytes.length, writer, {
      mode: "lz",
      rawSemanticBytes: bytes.length,
      tokenCount: tokens.length,
      backrefs: countKind(tokens, 1),
      literals: countKind(tokens, 0)
    });
  }

  /**
   * B"H. Learned n-gram storage. It discovers repeated byte phrases inside any
   * semantic stream, stores those phrases once, then emits literal bytes or
   * dictionary calls. This is the generic cousin of AST subtree recipes.
   */
  function ngramStorage(bytes) {
    const dict = buildDictionary(bytes);
    if (!dict.length) return impossibleStorage(bytes.length, "ngram-empty");
    const tokens = dictionaryTokens(bytes, dict);
    const writer = new BitWriter();
    writer.write(0xE9, 8);
    writer.write(1, 4);
    writer.tiny(bytes.length);
    writer.tiny(dict.length);
    for (let i = 0; i < dict.length; i += 1) {
      writer.tiny(dict[i].length);
      for (let j = 0; j < dict[i].length; j += 1) writer.write(dict[i][j], 8);
    }
    writer.tiny(tokens.length);
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (token.kind === 0) {
        writer.write(0, 1);
        writer.write(token.value, 8);
      } else {
        writer.write(1, 1);
        writer.tiny(token.id);
      }
    }
    return packageBits("AWTS-NGRAM-BIT-STORAGE", bytes.length, writer, {
      mode: "ngram",
      rawSemanticBytes: bytes.length,
      dictionaryEntries: dict.length,
      tokenCount: tokens.length,
      calls: countKind(tokens, 1),
      literals: countKind(tokens, 0)
    });
  }

  function packageBits(magic, rawLength, writer, detail) {
    const packed = writer.bytes;
    return {
      magic,
      version: 3,
      byteCount: packed.length,
      bitLength: writer.bitLength,
      preview: packed.slice(0, 512),
      bytes: packed,
      detail: Object.assign({}, detail, { storageSavedBytes: rawLength - packed.length })
    };
  }

  function impossibleStorage(rawLength, mode) {
    return { magic: "AWTS-IMPOSSIBLE", version: 3, byteCount: Number.MAX_SAFE_INTEGER, bitLength: 0, preview: [], bytes: [], detail: { mode, rawSemanticBytes: rawLength, storageSavedBytes: -Infinity } };
  }

  function decodeStorage(pack) {
    const bytes = pack.bytes || pack.preview || [];
    if (pack.magic === "AWTS-RAM-BARE") return bytes.slice();
    if (pack.magic === "AWTS-LZ-BIT-STORAGE") return decodeLz(bytes);
    if (pack.magic === "AWTS-NGRAM-BIT-STORAGE") return decodeNgram(bytes);
    return bytes.slice();
  }

  function decodeLz(bytes) {
    const reader = new BitReader(bytes);
    if (reader.read(8) !== 0xE7) return bytes.slice();
    reader.read(4);
    const outputLength = reader.tiny();
    const tokenCount = reader.tiny();
    const out = [];
    for (let i = 0; i < tokenCount; i += 1) {
      if (reader.read(1) === 0) out.push(reader.read(8));
      else {
        const length = reader.tiny() + 3;
        const distance = reader.tiny() + 1;
        for (let j = 0; j < length; j += 1) out.push(out[out.length - distance]);
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
    for (let i = 0; i < dictCount; i += 1) {
      const length = reader.tiny();
      const entry = [];
      for (let j = 0; j < length; j += 1) entry.push(reader.read(8));
      dict.push(entry);
    }
    const tokenCount = reader.tiny();
    const out = [];
    for (let i = 0; i < tokenCount; i += 1) {
      if (reader.read(1) === 0) out.push(reader.read(8));
      else {
        const entry = dict[reader.tiny()] || [];
        for (let j = 0; j < entry.length; j += 1) out.push(entry[j]);
      }
    }
    return out.slice(0, outputLength);
  }

  function buildRamImage(bytes) {
    const opcodes = [];
    const operands = [];
    for (let i = 0; i < bytes.length; i += 1) {
      if (i % 2 === 0) opcodes.push(bytes[i]);
      else operands.push(bytes[i]);
    }
    const constants = unique(bytes).slice(0, 256);
    const total = opcodes.length + operands.length + constants.length * 2;
    return {
      opcodes: new Uint8Array(opcodes),
      operands: new Uint8Array(operands),
      constants: new Uint16Array(constants),
      stringBytes: new Uint8Array([]),
      totalBytes: total,
      summary: { opcodes: opcodes.length, operands: operands.length, constants: constants.length, stringBytes: 0, totalBytes: total, typedArraysOnly: true }
    };
  }

  function buildDictionary(bytes) {
    const stats = Object.create(null);
    for (let size = 3; size <= 12; size += 1) {
      for (let i = 0; i + size <= bytes.length; i += 1) {
        const key = keyOf(bytes, i, size);
        if (!stats[key]) stats[key] = { bytes: bytes.slice(i, i + size), count: 0, score: 0 };
        stats[key].count += 1;
      }
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
    for (let i = 0; i < candidates.length; i += 1) {
      const key = candidates[i].bytes.join(",");
      if (used[key]) continue;
      used[key] = true;
      out.push(candidates[i]);
      if (out.length >= 31) break;
    }
    return out;
  }

  function dictionaryTokens(bytes, dict) {
    const tokens = [];
    let index = 0;
    while (index < bytes.length) {
      const match = dictionaryMatch(bytes, index, dict);
      if (match.id >= 0) {
        tokens.push({ kind: 1, id: match.id });
        index += dict[match.id].length;
      } else {
        tokens.push({ kind: 0, value: bytes[index] });
        index += 1;
      }
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
    bit(v) { const p = this.bitLength >> 3; const s = 7 - (this.bitLength & 7); this.bytes[p] = this.bytes[p] || 0; this.bytes[p] |= (v & 1) << s; this.bitLength += 1; }
    write(v, n) { for (let i = n - 1; i >= 0; i -= 1) this.bit((v >> i) & 1); }
    tiny(v) { if (v < 8) { this.write(0, 1); this.write(v, 3); } else if (v < 64) { this.write(2, 2); this.write(v, 6); } else { this.write(3, 2); this.write(v, 14); } }
  }

  class BitReader {
    constructor(bytes) { this.bytes = bytes; this.bitLength = 0; }
    read(n) { let out = 0; for (let i = 0; i < n; i += 1) { const p = this.bitLength >> 3; const s = 7 - (this.bitLength & 7); out = (out << 1) | ((this.bytes[p] >> s) & 1); this.bitLength += 1; } return out; }
    tiny() { if (this.read(1) === 0) return this.read(3); if (this.read(1) === 0) return this.read(6); return this.read(14); }
  }

  function keyOf(bytes, index, size) { let out = ""; for (let i = 0; i < size; i += 1) out += bytes[index + i] + ","; return out; }
  function matchesAt(bytes, index, entry) { if (index + entry.length > bytes.length) return false; for (let i = 0; i < entry.length; i += 1) if (bytes[index + i] !== entry[i]) return false; return true; }
  function unique(bytes) { const seen = Object.create(null), out = []; for (let i = 0; i < bytes.length; i += 1) if (!seen[bytes[i]]) { seen[bytes[i]] = true; out.push(bytes[i]); } return out; }
  function countKind(tokens, kind) { let count = 0; for (let i = 0; i < tokens.length; i += 1) if (tokens[i].kind === kind) count += 1; return count; }
  function round(value) { return Math.round(value * 100) / 100; }

  installStorageCodec();
})(typeof self !== "undefined" ? self : globalThis);
