// B"H

const { rowsCols } = require('../tensors/tensor-shape.js');
const { projectRowsFromBytes } = require('../kernels/matvec-stream.js');

/**
 * Projection directly from disposable pack bytes.
 *
 * This is the bridge from storage victory to runtime speed: the tensor no
 * longer asks the generic streamer for a full model cache slot. It speaks from
 * the one-run pack, then disappears.
 */
class PackProjector {
  constructor(reader) { this.reader = reader; }

  project(name, input) {
    const tensor = this.reader.tensor(name);
    if (!tensor) throw new Error(`B'H pack tensor missing: ${name}`);
    const { rows, cols } = rowsCols(tensor);
    const raw = this.reader.tensorBytes(name);
    return projectRowsFromBytes(raw, tensor.type, rows, cols, input);
  }
}

module.exports = { PackProjector };
