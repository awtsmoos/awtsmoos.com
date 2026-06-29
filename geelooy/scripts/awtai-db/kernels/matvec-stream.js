// B"H

const { rowsCols } = require('../tensors/tensor-shape.js');
const { canStreamRows, dotQuantizedRow, rowByteLength } = require('./quant-row-dot.js');

/**
 * Slow reference matvec for already materialized Float32 weights.
 * Kept as an oracle and fallback, not as the normal disk-first path.
 */
function matvecDequantized(weight, rows, cols, input) {
  const output = new Float32Array(rows);

  for (let row = 0; row < rows; row++) {
    let sum = 0;
    const base = row * cols;

    for (let col = 0; col < cols; col++) {
      sum += weight[base + col] * input[col];
    }

    output[row] = sum;
  }

  return output;
}

/**
 * Project a vector through the current tensor without Float32 matrix birth.
 *
 * This is execution-order streaming: the current tensor is read as raw
 * quantized bytes, consumed row by row with direct dot kernels, and then
 * released.  The model remains disk-first; only one tensor speaks at once.
 */
function projectTensor(streamer, tensor, input, trace, label) {
  const { rows, cols } = rowsCols(tensor);

  if (!canStreamRows(tensor, cols)) {
    throw new Error(`B'H cannot stream tensor rows for ${tensor && tensor.name}`);
  }

  if (trace) trace.mark(`before-project-tensor-read-${label}`);
  const raw = streamer.raw(tensor);
  if (trace) trace.mark(`after-project-tensor-read-${label}`);

  const output = projectRowsFromBytes(raw, tensor.type, rows, cols, input);
  if (trace) trace.mark(`after-project-direct-dot-${label}`);
  return output;
}

function projectRowsFromBytes(raw, type, rows, cols, input) {
  const output = new Float32Array(rows);
  const bytesPerRow = rowByteLength(type, cols);

  for (let row = 0; row < rows; row++) {
    const offset = row * bytesPerRow;
    const rowBytes = raw.subarray(offset, offset + bytesPerRow);
    output[row] = dotQuantizedRow(rowBytes, type, cols, input);
  }

  return output;
}

module.exports = { matvecDequantized, projectTensor, projectRowsFromBytes };
