#!/usr/bin/env node
// B"H

const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('../runtime/tensor-index.js');
const { PackReader } = require('../prepack/pack-reader.js');
const { PackProjector } = require('../prepack/pack-projector.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { projectRowsFromBytes } = require('../kernels/matvec-stream.js');

function main() {
  const [model, pack, tensorName = 'blk.0.attn_q.weight'] = process.argv.slice(2);
  if (!model || !pack) usage();
  const awtai = new AwtaiFile(model);
  const reader = new PackReader(pack);
  try {
    const index = new TensorIndex(awtai.manifest);
    const tensor = index.name(tensorName);
    if (!tensor) throw new Error(`B'H model tensor missing: ${tensorName}`);
    const { rows, cols } = rowsCols(tensor);
    const input = makeInput(cols);
    const modelOut = projectRowsFromBytes(awtai.tensorBytes(tensor), tensor.type, rows, cols, input);
    const packOut = new PackProjector(reader).project(tensorName, input);
    console.log(JSON.stringify(compare(modelOut, packOut), null, 2));
  } finally {
    reader.close();
    awtai.close();
  }
}

function makeInput(length) {
  const input = new Float32Array(length);
  for (let i = 0; i < length; i++) input[i] = Math.sin(i * 0.017) * 0.01;
  return input;
}

function compare(a, b) {
  let maxAbs = 0;
  let maxIndex = -1;
  for (let i = 0; i < a.length; i++) {
    const diff = Math.abs(a[i] - b[i]);
    if (diff > maxAbs) { maxAbs = diff; maxIndex = i; }
  }
  return { ok: maxAbs === 0, length: a.length, maxAbs, maxIndex, a: a[maxIndex], b: b[maxIndex] };
}

function usage() {
  console.error('B\"H usage: node bin/test-pack-project.js MODEL.awtai-db PACK.awtpack [tensorName]');
  process.exit(1);
}

main();
