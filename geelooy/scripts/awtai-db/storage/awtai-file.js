// B"H

const { RangeFile } = require('./range-file.js');
const utf8 = require('../core/utf8.js');
const { MAGIC, HEADER_SIZE } = require('../format/constants.js');

/**
 * Disk-backed AWTAI container reader.
 *
 * The model body remains on disk.  This class reveals only the requested
 * byte window, like a narrow candle walking through a palace of weights.
 */
class AwtaiFile {
  constructor(path) {
    this.file = new RangeFile(path);
    const header = this.file.read(0, HEADER_SIZE);
    const magic = utf8.decode(header.subarray(0, 8));

    if (magic !== MAGIC) throw new Error("B'H AWTAI magic missing");

    const view = new DataView(header.buffer, header.byteOffset, header.byteLength);
    const manifestLength = Number(view.getBigUint64(8, true));
    const manifestBytes = this.file.read(HEADER_SIZE, manifestLength);

    this.manifest = JSON.parse(utf8.decode(manifestBytes));
    this.dataOffset = HEADER_SIZE + manifestLength;
  }

  tensorOffset(tensor) {
    assertTensor(tensor);
    return this.dataOffset + tensor.awtaiOffset;
  }

  tensorBytes(tensor) {
    return this.tensorRangeBytes(tensor, 0, tensor.byteLength);
  }

  tensorRangeBytes(tensor, offset, length) {
    assertTensor(tensor);
    const start = normalizeRangeNumber(offset, 'offset');
    const size = normalizeRangeNumber(length, 'length');

    if (start + size > tensor.byteLength) {
      throw new RangeError(`B'H tensor range exceeds ${tensor.name}`);
    }

    return this.file.read(this.tensorOffset(tensor) + start, size);
  }

  close() {
    this.file.close();
  }
}

function assertTensor(tensor) {
  if (!tensor) throw new Error("B'H tensor is required");
}

function normalizeRangeNumber(value, label) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new RangeError(`B'H invalid tensor ${label}: ${value}`);
  }
  return number;
}

module.exports = { AwtaiFile };
