// B"H

/**
 * @file api/ai/direct/bertEmbedding.js
 * @chapter The Bidirectional Chamber
 * @description
 * BERT-style embedding inference for GGUF feature-extraction models. It runs
 * token/position/type embeddings, bidirectional attention blocks, GELU feed
 * forward layers, layer norms, CLS/mean pooling, and cosine-ready normalize.
 */

const Matrix = require('../math/matrix.js');

/**
 * @function embedBert
 * @param {object} engine - Initialized DirectEngine.
 * @param {string} text - Input text.
 * @param {object} [options] - Options.
 * @returns {Float32Array} Embedding.
 */
function embedBert(engine, text, options = {}) {
  const maps = engine.loader.layerTensorMap || [];
  if (!maps.length || !maps[0] || !maps[0].attn_q) throw new Error('B"H: BERT transformer tensors not found');

  const tokens = tokenIds(engine, text, options.maxTokens || 128);
  let states = initialStates(engine, tokens);

  for (let i = 0; i < maps.length; i++) {
    if (!maps[i] || !maps[i].attn_q) continue;
    states = layer(engine, maps[i], states);
  }

  const pooled = options.pooling === 'mean' ? meanPool(states) : states[0].slice();
  const final = resize(pooled, options.dimensions || options.dim || pooled.length);
  return normalize(final);
}

function tokenIds(engine, text, maxTokens) {
  const out = [];
  engine.tokenizer._tokenizeSegment(String(text || ''), out);
  return (out.length ? out : [0]).slice(0, maxTokens).map((n) => Math.abs(n | 0) % Math.max(engine.vocab.length, 1));
}

function initialStates(engine, tokens) {
  const embName = engine.loader.globalTensorMap.embed;
  const embInfo = engine.loader.tensorMap.get(embName);
  const emb = engine.loader.getTensor(embName);
  const shape = shapeFor(embInfo, engine.vocab.length);
  const width = shape.width;
  const pos = tensor(engine, engine.loader.globalTensorMap.position_embed);
  const typ = tensor(engine, engine.loader.globalTensorMap.token_type_embed);
  const states = [];

  for (let t = 0; t < tokens.length; t++) {
    const row = new Float32Array(width);
    addRow(row, emb, shape, tokens[t]);
    if (pos) addRow(row, pos.data, pos.shape, Math.min(t, pos.shape.rows - 1));
    if (typ) addRow(row, typ.data, typ.shape, 0);
    states.push(layerNorm(row, tensor(engine, engine.loader.globalTensorMap.output_norm), tensor(engine, engine.loader.globalTensorMap.output_norm_bias), 1e-5));
  }

  return states;
}

function layer(engine, map, states) {
  const q = projectAll(engine, states, map.attn_q, map.attn_q_bias);
  const k = projectAll(engine, states, map.attn_k, map.attn_k_bias);
  const v = projectAll(engine, states, map.attn_v, map.attn_v_bias);
  const dim = q[0].length;
  const attended = [];

  for (let i = 0; i < states.length; i++) {
    const scores = new Float32Array(states.length);
    for (let j = 0; j < states.length; j++) scores[j] = dot(q[i], k[j]) / Math.sqrt(dim || 1);
    softmax(scores);
    const ctx = new Float32Array(v[0].length);
    for (let j = 0; j < states.length; j++) {
      for (let d = 0; d < ctx.length; d++) ctx[d] += scores[j] * v[j][d];
    }
    const out = dense(engine, ctx, map.attn_out, map.attn_out_bias);
    attended.push(layerNorm(add(states[i], out), tensor(engine, map.attn_post_norm || map.attn_norm), tensor(engine, map.attn_post_norm_bias || map.attn_norm_bias), 1e-5));
  }

  return attended.map((x) => {
    const hidden = gelu(dense(engine, x, map.ffn_up, map.ffn_up_bias));
    const out = dense(engine, hidden, map.ffn_down, map.ffn_down_bias);
    return layerNorm(add(x, out), tensor(engine, map.ffn_post_norm || map.ffn_norm), tensor(engine, map.ffn_post_norm_bias || map.ffn_norm_bias), 1e-5);
  });
}

function projectAll(engine, states, weightName, biasName) {
  return states.map((x) => dense(engine, x, weightName, biasName));
}

function dense(engine, x, weightName, biasName) {
  if (!weightName) return x.slice();
  const info = engine.loader.tensorMap.get(weightName);
  const w = engine.loader.getTensor(weightName);
  const outDim = inferOut(info, x.length);
  const y = Matrix.matVecMul(x, w, outDim);
  const b = tensor(engine, biasName);
  if (b) for (let i = 0; i < Math.min(y.length, b.data.length); i++) y[i] += b.data[i];
  return y;
}

function inferOut(info, inDim) {
  const dims = info && info.dims ? info.dims : [];
  if (dims[0] === inDim) return Number(dims[1] || inDim);
  return Number(dims[0] || inDim);
}

function tensor(engine, name) {
  if (!name) return null;
  const info = engine.loader.tensorMap.get(name);
  const data = engine.loader.getTensor(name);
  if (!info || !data) return null;
  return { info, data, shape: shapeFor(info, engine.vocab.length) };
}

function shapeFor(info, rowsHint) {
  const dims = info && info.dims ? info.dims : [1, 1];
  if (dims.length < 2) return { rows: dims[0] || rowsHint || 1, width: 1, rowMajor: true };
  const a = Number(dims[0]);
  const b = Number(dims[1]);
  if (b === rowsHint) return { rows: b, width: a, rowMajor: false };
  return { rows: a, width: b, rowMajor: true };
}

function addRow(out, table, shape, row) {
  for (let i = 0; i < out.length; i++) {
    const offset = shape.rowMajor ? row * shape.width + i : i * shape.rows + row;
    out[i] += table[offset] || 0;
  }
}

function layerNorm(x, weight, bias, eps) {
  if (!weight && !bias) return x;
  let mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i];
  mean /= Math.max(x.length, 1);
  let variance = 0;
  for (let i = 0; i < x.length; i++) variance += (x[i] - mean) * (x[i] - mean);
  const scale = 1 / Math.sqrt(variance / Math.max(x.length, 1) + eps);
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = (x[i] - mean) * scale * (weight ? weight.data[i] || 1 : 1) + (bias ? bias.data[i] || 0 : 0);
  return out;
}

function add(a, b) {
  const out = new Float32Array(Math.max(a.length, b.length));
  for (let i = 0; i < out.length; i++) out[i] = (a[i] || 0) + (b[i] || 0);
  return out;
}

function gelu(x) {
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    out[i] = 0.5 * v * (1 + Math.tanh(0.7978845608 * (v + 0.044715 * v * v * v)));
  }
  return out;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

function softmax(x) {
  let max = -Infinity;
  for (let i = 0; i < x.length; i++) if (x[i] > max) max = x[i];
  let sum = 0;
  for (let i = 0; i < x.length; i++) { x[i] = Math.exp(x[i] - max); sum += x[i]; }
  for (let i = 0; i < x.length; i++) x[i] /= sum || 1;
}

function meanPool(states) {
  const out = new Float32Array(states[0].length);
  for (const row of states) for (let i = 0; i < out.length; i++) out[i] += row[i];
  for (let i = 0; i < out.length; i++) out[i] /= states.length;
  return out;
}

function resize(vector, dim) {
  if (dim === vector.length) return vector;
  const out = new Float32Array(dim);
  out.set(vector.subarray(0, Math.min(dim, vector.length)));
  return out;
}

function normalize(vector) {
  let mag = 0;
  for (let i = 0; i < vector.length; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag) || 1;
  for (let i = 0; i < vector.length; i++) vector[i] /= mag;
  return vector;
}

module.exports = { embedBert };
