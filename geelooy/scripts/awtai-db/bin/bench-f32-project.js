#!/usr/bin/env node
// B"H

const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { dequant } = require('../math/dequant.js');
const { rowsCols, elements } = require('../tensors/tensor-shape.js');
const { projectRowsFromBytes } = require('../kernels/matvec-stream.js');
const { nativeProjectF32Rows, nativeStatus } = require('../native/native-matvec.js');

function main() {
  const model = process.argv[2];
  const name = process.argv[3] || 'blk.0.attn_q.weight';
  if (!model) usage();
  const file = new AwtaiFile(model);
  try {
    const index = new TensorIndex(file.manifest);
    const tensor = index.name(name);
    if (!tensor) throw new Error(`B'H tensor not found: ${name}`);
    const { rows, cols } = rowsCols(tensor);
    const input = makeInput(cols);
    const raw = file.tensorBytes(tensor);
    const quant = measure('quantNative', () => projectRowsFromBytes(raw, tensor.type, rows, cols, input), 5);
    const deq = time(() => dequant(raw, tensor.type, elements(tensor)));
    const f32 = measure('f32Accelerate', () => nativeProjectF32Rows(deq.value, rows, cols, input), 25);
    const once = nativeProjectF32Rows(deq.value, rows, cols, input);
    const qonce = projectRowsFromBytes(raw, tensor.type, rows, cols, input);
    console.log(JSON.stringify({
      ok: true,
      native: nativeStatus(),
      tensor: { name: tensor.name, type: tensor.type, rows, cols, rawBytes: raw.byteLength, f32Bytes: deq.value.byteLength },
      dequantMs: deq.ms,
      quant,
      f32,
      compare: compare(qonce, once),
      maxRssMiB: process.memoryUsage().rss / 1024 / 1024,
    }, null, 2));
  } finally {
    file.close();
  }
}

function makeInput(length) {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.sin(i * 0.013) * 0.02;
  return out;
}

function measure(label, fn, rounds) {
  const rows = [];
  for (let i = 0; i < rounds; i++) rows.push(time(fn).ms);
  rows.sort((a, b) => a - b);
  return { label, rounds, minMs: rows[0], medianMs: rows[Math.floor(rows.length / 2)], maxMs: rows[rows.length - 1] };
}

function time(fn) {
  const start = process.hrtime.bigint();
  const value = fn();
  return { value, ms: Number(process.hrtime.bigint() - start) / 1e6 };
}

function compare(a, b) {
  let maxAbs = 0;
  let maxIndex = -1;
  for (let i = 0; i < a.length; i++) {
    const diff = Math.abs(a[i] - b[i]);
    if (diff > maxAbs) { maxAbs = diff; maxIndex = i; }
  }
  return { maxAbs, maxIndex, a: maxIndex >= 0 ? a[maxIndex] : null, b: maxIndex >= 0 ? b[maxIndex] : null };
}

function usage() {
  console.error('B\\"H usage: node bin/bench-f32-project.js MODEL.awtai-db [tensorName]');
  process.exit(1);
}

main();
