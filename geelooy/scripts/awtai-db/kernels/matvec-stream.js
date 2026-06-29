// B"H
const { rowsCols } = require('../tensors/tensor-shape.js');
const { canStreamRows, dotQuantizedRow, rowByteLength } = require('./quant-row-dot.js');
const { nativeProjectRows, nativeProjectFileRows, nativeStatus } = require('../native/native-matvec.js');

/** Project one tensor; low-RAM path maps file windows and never returns raw bytes to JS. */
function projectTensor(streamer, tensor, input, trace, label) {
  const { rows, cols } = rowsCols(tensor);
  if (!canStreamRows(tensor, cols)) throw new Error(`B'H cannot stream rows for ${tensor && tensor.name}`);
  const direct = projectFromFile(streamer, tensor, rows, cols, input);
  if (direct) {
    if (trace) trace.mark(`after-project-file-${label}`);
    return direct;
  }
  if (trace) trace.mark(`before-project-tensor-read-${label}`);
  const raw = streamer.raw(tensor);
  if (trace) trace.mark(`after-project-tensor-read-${label}`);
  const output = projectRowsFromBytes(raw, tensor.type, rows, cols, input);
  if (trace) trace.mark(`after-project-direct-dot-${label}`);
  return output;
}

function projectFromFile(streamer, tensor, rows, cols, input) {
  if (!useFileProject() || !streamer.file || !streamer.file.file) return null;
  const out = nativeProjectFileRows(streamer.file.file.path, streamer.file.tensorOffset(tensor), tensor.type, rows, cols, input);
  if (out && streamer.stats) streamer.stats.read(tensor.byteLength, `${tensor.name}:mmap-project`);
  return out;
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

function matvecDequantized(weight, rows, cols, input) {
  const output = new Float32Array(rows);
  for (let row = 0; row < rows; row++) {
    let sum = 0, base = row * cols;
    for (let col = 0; col < cols; col++) sum += weight[base + col] * input[col];
    output[row] = sum;
  }
  return output;
}

function useFileProject() { return /^(1|true|yes)$/.test(String(process.env.AWTAI_FILE_PROJECT || '')); }
module.exports = { matvecDequantized, projectTensor, projectRowsFromBytes, nativeStatus };
