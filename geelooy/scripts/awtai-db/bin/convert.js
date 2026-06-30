#!/usr/bin/env node
// B"H
const path = require('path');
const { convertGgufFile } = require('../awtai/converter.js');

const input = process.argv[2];
if (!input) usage();
const out = process.argv[3] || input.replace(/\.gguf$/i, '') + '.awtai-db';
const started = process.hrtime.bigint();
const result = convertGgufFile(input, out, { name: path.basename(input) });
const wallMs = Number(process.hrtime.bigint() - started) / 1e6;
console.log(JSON.stringify({
  output: result.output,
  tensors: result.tensors,
  packets: result.packets,
  bytes: result.bytes,
  tensorBytes: result.tensorBytes,
  windowBytes: result.windowBytes,
  wallMs,
  rssMiB: process.memoryUsage().rss / 1048576
}, null, 2));

function usage() {
  console.error('Usage: convert input.gguf [out.awtai-db]');
  process.exit(1);
}
