// B"H
const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { siluMulInto } = require('../kernels/activation.js');
const { addInto } = require('../kernels/add.js');
const { nativeFfn, nativeMappedFfn } = require('../native/native-matvec.js');

function ffnStep(ctx, layer, x) {
  const { index, streamer, config, trace } = ctx;
  const norm = streamer.float(index.name(`blk.${layer}.ffn_norm.weight`));
  const h = new Float32Array(config.hidden);
  rmsNormInto(h, x, norm, config.eps);
  const fused = tryNativeFfn(ctx, layer, h);
  if (fused) {
    addInto(x, fused);
    if (trace) trace.mark(`after-fused-ffn-${layer}`);
    return x;
  }
  const gate = projectTensor(streamer, index.role('ffn_gate', layer), h, trace, `L${layer}-gate`);
  const up = projectTensor(streamer, index.role('ffn_up', layer), h, trace, `L${layer}-up`);
  siluMulInto(gate, gate, up);
  const down = projectTensor(streamer, index.role('ffn_down', layer), gate, trace, `L${layer}-down`);
  addInto(x, down);
  return x;
}

function tryNativeFfn(ctx, layer, h) {
  if (/^(1|true|yes)$/.test(String(process.env.AWTAI_FILE_PROJECT || ''))) return null;
  const { index, streamer, config } = ctx;
  const gate = index.role('ffn_gate', layer);
  const up = index.role('ffn_up', layer);
  const down = index.role('ffn_down', layer);
  if (!gate || !up || !down) return null;
  const mapped = tryMappedFfn(streamer, gate, up, down, config, h);
  if (mapped) return mapped;
  if (!/^(1|true|yes)$/.test(String(process.env.AWTAI_RAW_FFN || ''))) return null;
  return nativeFfn(streamer.raw(gate), gate.type, streamer.raw(up), up.type, streamer.raw(down), down.type, config.hidden, config.ffn, h);
}

function tryMappedFfn(streamer, gate, up, down, config, h) {
  if (!streamer.nativeMap || typeof streamer.offset !== 'function') return null;
  return nativeMappedFfn(
    streamer.nativeMap,
    { offset: streamer.offset(gate), type: gate.type },
    { offset: streamer.offset(up), type: up.type },
    { offset: streamer.offset(down), type: down.type },
    config.hidden,
    config.ffn,
    h
  );
}

module.exports = { ffnStep };
