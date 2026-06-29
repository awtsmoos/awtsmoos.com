// B"H

const fs = require('fs');
const path = require('path');
const { encodeHeader } = require('./pack-format.js');
const { layerTensorGroups, globalTensorGroups, resolveGroup } = require('./tensor-groups.js');
const { updateManifest } = require('../runtime/run-cache.js');

const CHUNK = 8 * 1024 * 1024;

/**
 * Writes disposable layer packs from the single canonical .awtai-db.
 *
 * This is not a second model format. It is the trail of sparks left by one
 * model as it runs: grouped bytes, offsets, and promises for the native path.
 */
function writeAllPacks({ awtaiFile, index, config, cache }) {
  const packs = [];
  for (let layer = 0; layer < config.layers; layer++) {
    for (const group of layerTensorGroups(layer)) {
      packs.push(writeGroup({ awtaiFile, index, cache, group, layer }));
    }
  }
  for (const group of globalTensorGroups()) packs.push(writeGroup({ awtaiFile, index, cache, group }));
  updateManifest(cache, manifest => { manifest.packs = packs; manifest.config = config; });
  return packs;
}

function writeGroup({ awtaiFile, index, cache, group, layer = null }) {
  const resolved = resolveGroup(index, group);
  const file = path.join(cache.root, 'layers', group.file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tensors = describeTensors(resolved.tensors);
  const manifest = {
    BH: 'B\"H',
    kind: 'awtai-runtime-pack',
    oneModelFormat: true,
    group: resolved.kind,
    layer,
    tensors,
  };
  const encoded = encodeHeader(manifest);
  const out = fs.openSync(file, 'w');
  try {
    fs.writeSync(out, encoded.header);
    fs.writeSync(out, encoded.json);
    for (const tensor of resolved.tensors) copyTensor(awtaiFile, tensor, out);
  } finally {
    fs.closeSync(out);
  }
  const stat = fs.statSync(file);
  return { kind: resolved.kind, layer, file, bytes: stat.size, tensors: tensors.map(t => t.name) };
}

function describeTensors(tensors) {
  let offset = 0;
  return tensors.map(tensor => {
    const entry = {
      name: tensor.name,
      role: tensor.role || null,
      layer: tensor.layer ?? null,
      type: tensor.type,
      dims: tensor.dims,
      byteLength: tensor.byteLength,
      payloadOffset: offset,
    };
    offset += tensor.byteLength;
    return entry;
  });
}

function copyTensor(awtaiFile, tensor, fd) {
  let offset = 0;
  while (offset < tensor.byteLength) {
    const size = Math.min(CHUNK, tensor.byteLength - offset);
    const bytes = awtaiFile.tensorRangeBytes(tensor, offset, size);
    fs.writeSync(fd, bytes);
    offset += size;
  }
}

module.exports = { writeAllPacks, writeGroup };
