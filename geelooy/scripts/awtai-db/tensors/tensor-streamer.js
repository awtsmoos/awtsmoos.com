// B"H

const { dequant } = require('../math/dequant.js');
const { elements } = require('./tensor-shape.js');

/**
 * Thin tensor access layer for the disk-first runner.
 *
 * Whole tensors may still be read for small vectors, but projection code
 * should ask for ranges.  The Awtsmoos is revealed one measured slice at
 * a time; RAM is no longer asked to pretend it is the whole universe.
 */
class TensorStreamer {
  constructor(file, stats) {
    this.file = file;
    this.stats = stats;
  }

  raw(tensor) {
    const bytes = this.file.tensorBytes(tensor);
    this.noteRead(bytes.length, tensor && tensor.name);
    return bytes;
  }

  range(tensor, offset, length) {
    const bytes = this.file.tensorRangeBytes(tensor, offset, length);
    this.noteRead(bytes.length, tensor && tensor.name);
    return bytes;
  }

  float(tensor) {
    const bytes = this.raw(tensor);
    const values = dequant(bytes, tensor.type, elements(tensor));
    this.noteDequant(bytes.length, tensor && tensor.name);
    return values;
  }

  noteRead(length, name) {
    if (this.stats) this.stats.read(length, name);
  }

  noteDequant(length, name) {
    if (this.stats) this.stats.dequant(length, name);
  }

  dispose() {}
}

module.exports = { TensorStreamer };
