// B"H

const { dequant } = require('../math/dequant.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { rowByteLength } = require('../kernels/quant-row-dot.js');

/**
 * Read one token embedding row from disk.
 *
 * The old path summoned the whole vocabulary table into RAM.  This path
 * asks only for the one row whose token is now speaking.  A single glyph
 * opens its gate; the whole palace remains resting on disk.
 */
function embedding(streamer, tensor, token) {
  const { cols, rows } = rowsCols(tensor);
  const safeToken = clampToken(token, rows);
  const bytesPerRow = rowByteLength(tensor.type, cols);
  const row = streamer.range(tensor, safeToken * bytesPerRow, bytesPerRow);
  return dequant(row, tensor.type, cols);
}

function clampToken(token, rows) {
  const id = Number(token);
  if (Number.isSafeInteger(id) && id >= 0 && id < rows) return id;
  return 0;
}

module.exports = { embedding };
