// B"H

/**
 * @file utils/compression/rle.js
 * @chapter The Long Note Held In One Breath
 * @description
 * When one byte repeats like a single word of creation ringing through many
 * chambers, RLE stores the chant once with a count. It is simple, fast, and
 * chosen only when it beats raw physical inscription.
 */

const MAX_RUN = 130;
const MAX_LITERAL = 128;
const MIN_RUN = 4;

/**
 * @class RunLengthCodec
 * @description Byte run-length codec using high-bit run tags.
 */
class RunLengthCodec {
  /**
   * @static
   * @method compress
   * @description Compresses bytes into literal and run packets.
   * @param {Buffer} source - Source bytes.
   * @returns {Buffer} Packet stream.
   */
  static compress(source) {
    const out = [];

    for (let i = 0; i < source.length;) {
      let run = 1;

      while (i + run < source.length && source[i + run] === source[i] && run < MAX_RUN) {
        run++;
      }

      if (run >= MIN_RUN) {
        out.push(0x80 | (run - MIN_RUN), source[i]);
        i += run;
        continue;
      }

      const literalStart = i;
      i += run;

      while (i < source.length && i - literalStart < MAX_LITERAL) {
        let nextRun = 1;

        while (i + nextRun < source.length && source[i + nextRun] === source[i] && nextRun < MAX_RUN) {
          nextRun++;
        }

        if (nextRun >= MIN_RUN) break;
        i += nextRun;
      }

      const literalLength = i - literalStart;
      out.push(literalLength - 1);

      for (let j = literalStart; j < i; j++) {
        out.push(source[j]);
      }
    }

    return Buffer.from(out);
  }

  /**
   * @static
   * @method decompress
   * @description Restores bytes from packet stream.
   * @param {Buffer} packed - Packet stream.
   * @param {number} rawLength - Expected output bytes.
   * @returns {Buffer} Restored bytes.
   */
  static decompress(packed, rawLength) {
    const out = Buffer.allocUnsafe(rawLength);
    let input = 0;
    let output = 0;

    while (output < rawLength && input < packed.length) {
      const tag = packed[input++];

      if (tag & 0x80) {
        const run = (tag & 0x7f) + MIN_RUN;
        const byte = packed[input++];
        out.fill(byte, output, output + run);
        output += run;
      } else {
        const len = tag + 1;
        packed.copy(out, output, input, input + len);
        input += len;
        output += len;
      }
    }

    return out;
  }
}

module.exports = RunLengthCodec;
