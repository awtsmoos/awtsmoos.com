// B"H
const root = '../../..';
const path = require('path');
const base = path.resolve(__dirname, root);
const timings = new Map();

function add(label, ns) {
  const old = timings.get(label) || { count: 0, ns: 0n };
  old.count++;
  old.ns += ns;
  timings.set(label, old);
}

function timed(label, fn) {
  return function timedWrapper(...args) {
    const t0 = process.hrtime.bigint();
    try {
      return fn.apply(this, args);
    } finally {
      add(label, process.hrtime.bigint() - t0);
    }
  };
}

const matvec = require(path.join(base, 'kernels/matvec-stream.js'));
const originalProject = matvec.projectTensor;
matvec.projectTensor = function patchedProjectTensor(streamer, tensor, input, trace, label) {
  const normalized = String(label || 'unknown').replace(/L\d+-/, 'L*-');
  const t0 = process.hrtime.bigint();
  try {
    return originalProject(streamer, tensor, input, trace, label);
  } finally {
    add(`project:${normalized}`, process.hrtime.bigint() - t0);
  }
};

const attention = require(path.join(base, 'attention/full-attention.js'));
attention.attend = timed('attention:attend', attention.attend);

const rms = require(path.join(base, 'kernels/rms-norm.js'));
rms.rmsNormInto = timed('kernel:rmsNormInto', rms.rmsNormInto);

const act = require(path.join(base, 'kernels/activation.js'));
act.siluMulInto = timed('kernel:siluMulInto', act.siluMulInto);

const { runChat } = require(path.join(base, 'decode/chat-loop.js'));
const model = '/Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db';
const maxNewTokens = Number(process.env.AWTAI_PROFILE_NEW || 1);
const cacheBytes = Number(process.env.AWTAI_PROFILE_CACHE_BYTES || 1536 * 1024 * 1024);
const prompt = process.env.AWTAI_PROFILE_PROMPT || 'Write one sentence.';
const started = process.hrtime.bigint();
const result = runChat(model, prompt, {
  maxNewTokens,
  minNewTokens: 0,
  topK: 8,
  maxRamKvTokens: 64,
  tensorCacheBytes: cacheBytes,
});
const totalNs = process.hrtime.bigint() - started;
const rows = [...timings.entries()].map(([label, value]) => ({
  label,
  count: value.count,
  totalMs: Number(value.ns) / 1e6,
  avgMs: Number(value.ns) / 1e6 / value.count,
})).sort((a, b) => b.totalMs - a.totalMs);

console.log(JSON.stringify({
  prompt,
  maxNewTokens,
  cacheBytes,
  text: result.text,
  generated: result.generated,
  promptTokens: result.promptTokens.length,
  totalMs: Number(totalNs) / 1e6,
  tokenPasses: Math.max(0, result.promptTokens.length - 1) + result.generated.length,
  layers: result.stats.layers,
  maxRss: result.memory.maxRss,
  streamer: result.streamer,
  stats: {
    readBytes: result.stats.readBytes,
    tensorsRead: result.stats.tensorsRead,
    dequantBytes: result.stats.dequantBytes,
  },
  timings: rows.slice(0, 60),
}, null, 2));
