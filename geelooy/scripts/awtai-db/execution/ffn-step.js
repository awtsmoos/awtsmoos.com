// B"H

const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { siluMulInto } = require('../kernels/activation.js');
const { addInto } = require('../kernels/add.js');
const { nativeFfn } = require('../native/native-matvec.js');

/**
 * One pre-norm FFN block.
 *
 * First path: the gate, up, SiLU product, and down projection enter a fused C
 * chamber.  Fallback path remains the old verified river.  The goal is not a
 * new answer; it is fewer JS/native crossings while the same answer survives.
 */
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
  const { index, streamer, config } = ctx;
  const gate = index.role('ffn_gate', layer);
  const up = index.role('ffn_up', layer);
  const down = index.role('ffn_down', layer);
  if (!gate || !up || !down) return null;
  return nativeFfn(
    streamer.raw(gate), gate.type,
    streamer.raw(up), up.type,
    streamer.raw(down), down.type,
    config.hidden, config.ffn, h,
  );
}

module.exports = { ffnStep };
