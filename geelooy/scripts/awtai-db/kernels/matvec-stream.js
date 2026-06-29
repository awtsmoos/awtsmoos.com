// B"H

const { rowsCols } = require('../tensors/tensor-shape.js');
const { canStreamRows, dotQuantizedRow, rowByteLength } = require('./quant-row-dot.js');
const { nativeProjectRows, nativeStatus } = require('../native/native-matvec.js');

/** Slow Float32 oracle/fallback for already materialized weights. */
function matvecDequantized(weight, rows, cols, input) {
  const output = new Float32Array(rows);
  for (let row = 0; row < rows; row++) {
    let sum = 0;
    const base = row * cols;
    for (let col = 0; col < cols; col++) sum += weight[base + col] * input[col];
    output[row] = sum;
  }
  return output;
}

/**
 * Project a vector through one disk tensor.
 *
 * The tensor rises from disk as packed bytes, gives one breath of matvec,
 * and falls away.  When the C Q2_K gate exists, the dot storm enters native
 * code; otherwise the verified JS direct row oracle remains the vessel.
 */
function projectTensor(streamer, tensor, input, trace, label) {
  const { rows, cols } = rowsCols(tensor);
  if (!canStreamRows(tensor, cols)) throw new Error(`B'H cannot stream rows for ${tensor && tensor.name}`);
  if (trace) trace.mark(`before-project-tensor-read-${label}`);
  const raw = streamer.raw(tensor);
  if (trace) trace.mark(`after-project-tensor-read-${label}`);
  const output = projectRowsFromBytes(raw, tensor.type, rows, cols, input);
  if (trace) trace.mark(`after-project-direct-dot-${label}`);
  return output;
}

function projectRowsFromBytes(raw, type, rows, cols, input) {
  const native = nativeProjectRows(raw, type, rows, cols, input);
  if (native) return native;
  const output = new Float32Array(rows);
  const bytesPerRow = rowByteLength(type, cols);
  for (let row = 0; row < rows; row++) {
    const offset = row * bytesPerRow;
    output[row] = dotQuantizedRow(raw.subarray(offset, offset + bytesPerRow), type, cols, input);
  }
  return output;
}

module.exports = { matvecDequantized, projectTensor, projectRowsFromBytes, nativeStatus };
