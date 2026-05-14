// B"H

/**
 * @file utils/compression/lz.js
 * @chapter The Returning Echo In The Letter-Cavern
 * @description
 * A tiny byte-level LZ scribe. Repeated speech is not written twice when an
 * earlier echo can carry it. The Awtsmoos renews every byte every instant, yet
 * this vessel records only the path back to a prior revealed phrase.
 */

const HASH_SIZE = 65536;
const MIN_MATCH = 4;
const MAX_MATCH = 131;
const MAX_OFFSET = 65535;

/**
 * @function hashAt
 * @description Hashes three bytes into a fixed table slot.
 * @param {Buffer} source - Source bytes.
 * @param {number} index - Byte index.
 * @returns {number} Hash table index.
 */
function hashAt(source, index) {
  return (
    (source[index] * 73856093) ^
    (source[index + 1] * 19349663) ^
    (source[index + 2] * 83492791)
  ) & (HASH_SIZE - 1);
}

/**
 * @function countMatch
 * @description Counts matching bytes up to the token limit.
 * @param {Buffer} source - Source bytes.
 * @param {number} here - Current position.
 * @param {number} there - Prior position.
 * @returns {number} Match length.
 */
function countMatch(source, here, there) {
  const cap = Math.min(MAX_MATCH, source.length - here);
  let len = 0;

  while (len < cap && source[here + len] === source[there + len]) {
    len++;
  }

  return len;
}

/**
 * @class TinyLz
 * @description Fast custom LZ copy-token codec with no dependency altar.
 */
class TinyLz {
  /**
   * @static
   * @method compress
   * @description Compresses bytes using literal/copy flag groups.
   * @param {Buffer} source - Raw bytes.
   * @returns {Buffer} Compressed token stream.
   */
  static compress(source) {
    if (!source || source.length < MIN_MATCH) return Buffer.from(source || []);

    const table = new Int32Array(HASH_SIZE);
    table.fill(-1);

    const out = [0];
    let flagIndex = 0;
    let flags = 0;
    let bit = 1;

    const sealFlag = () => {
      bit <<= 1;
      if (bit === 256) {
        out[flagIndex] = flags;
        flagIndex = out.length;
        out.push(0);
        flags = 0;
        bit = 1;
      }
    };

    for (let i = 0; i < source.length;) {
      let copied = false;

      if (i <= source.length - MIN_MATCH) {
        const h = hashAt(source, i);
        const ref = table[h];
        table[h] = i;

        if (
          ref >= 0 &&
          i - ref <= MAX_OFFSET &&
          source[ref] === source[i] &&
          source[ref + 1] === source[i + 1] &&
          source[ref + 2] === source[i + 2]
        ) {
          const len = countMatch(source, i, ref);

          if (len >= MIN_MATCH) {
            const offset = i - ref;
            flags |= bit;
            out.push(offset & 0xff, offset >>> 8, len - MIN_MATCH);

            for (let j = 1; j < len && i + j <= source.length - MIN_MATCH; j++) {
              table[hashAt(source, i + j)] = i + j;
            }

            i += len;
            copied = true;
          }
        }
      }

      if (!copied) {
        out.push(source[i++]);
      }

      sealFlag();
    }

    out[flagIndex] = flags;
    return Buffer.from(out);
  }

  /**
   * @static
   * @method decompress
   * @description Restores bytes from a token stream and expected size.
   * @param {Buffer} packed - Token stream.
   * @param {number} rawLength - Expected output length.
   * @returns {Buffer} Restored bytes.
   */
  static decompress(packed, rawLength) {
    const out = Buffer.allocUnsafe(rawLength);
    let input = 0;
    let output = 0;
    let flags = 0;
    let bit = 256;

    while (output < rawLength) {
      if (bit === 256) {
        flags = packed[input++] || 0;
        bit = 1;
      }

      if (flags & bit) {
        const offset = packed[input++] | (packed[input++] << 8);
        const len = (packed[input++] || 0) + MIN_MATCH;
        const start = output - offset;

        for (let i = 0; i < len && output < rawLength; i++) {
          out[output++] = out[start + i];
        }
      } else {
        out[output++] = packed[input++];
      }

      bit <<= 1;
    }

    return out;
  }
}

module.exports = TinyLz;
