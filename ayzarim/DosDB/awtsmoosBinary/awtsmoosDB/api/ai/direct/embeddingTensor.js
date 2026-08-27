// B"H

/**
 * @file api/ai/direct/embeddingTensor.js
 * @chapter The First Breath Of The Model
 * @description
 * A small, real GGUF embedding path. It does not pretend that every
 * transformer block has been conquered for every architecture; it does the
 * honest first work required by embedding models: tokenize the user's words,
 * pull their rows from the model's own token embedding tensor, blend the rows
 * without loading extra model tables, and normalize the result for vector
 * search. The Awtsmoos speaks letters into matter; here the GGUF tensor speaks
 * numbers into search.
 */

const TOKEN_EMBED_NAMES = [
  'token_embd.weight',
  'model.embed_tokens.weight',
  'bert.embeddings.word_embeddings.weight',
  'embeddings.word_embeddings.weight'
];

/**
 * @function findTokenEmbeddingName
 * @description Finds the token embedding tensor name in common GGUF layouts.
 * @param {object} engine - Initialized direct engine.
 * @returns {string|null} Tensor name.
 */
function findTokenEmbeddingName(engine) {
  for (const name of TOKEN_EMBED_NAMES) {
    if (engine.loader.tensorMap.has(name)) return name;
  }
  return engine.loader.globalTensorMap.embed || null;
}

/**
 * @function rowShape
 * @description Infers row count and width from GGUF tensor dimensions.
 * @param {object} info - Tensor metadata.
 * @param {number} vocabSize - Token count.
 * @returns {{rows:number,width:number,rowMajor:boolean}}
 */
function rowShape(info, vocabSize) {
  const dims = info.dims || [];
  if (dims.length < 2) {
    return { rows: vocabSize, width: Math.max(1, Math.floor(dims[0] || 1)), rowMajor: true };
  }

  const a = dims[0];
  const b = dims[1];
  if (a === vocabSize) return { rows: a, width: b, rowMajor: true };
  if (b === vocabSize) return { rows: b, width: a, rowMajor: false };
  if (a > b) return { rows: a, width: b, rowMajor: true };
  return { rows: b, width: a, rowMajor: false };
}

/**
 * @function normalize
 * @description Normalizes a vector for cosine search.
 * @param {Float32Array} vector - Mutable vector.
 * @returns {Float32Array} Same vector.
 */
function normalize(vector) {
  let mag = 0;
  for (let i = 0; i < vector.length; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag) || 1;
  for (let i = 0; i < vector.length; i++) vector[i] /= mag;
  return vector;
}

/**
 * @function tokenizeReady
 * @description Tokenizes only after the model tokenizer has truly initialized.
 * @param {object} tokenizer - Direct-engine tokenizer.
 * @param {string} text - Text to split into model token ids.
 * @returns {Array<number>} Token ids.
 */
function tokenizeReady(tokenizer, text) {
  if (!tokenizer || tokenizer.initialized !== true) {
    throw new Error('B"H: embedding tokenizer is not initialized yet');
  }
  const output = [];
  const specialKeys = Array.from(tokenizer.specialTokens.keys()).sort((a, b) => b.length - a.length);
  let parts = [String(text || '')];

  if (specialKeys.length > 0) {
    const pattern = new RegExp(`(${specialKeys.map(s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g');
    parts = parts[0].split(pattern);
  }

  for (const part of parts) {
    if (!part) continue;
    if (tokenizer.specialTokens.has(part)) output.push(tokenizer.specialTokens.get(part));
    else tokenizer._tokenizeSegment(part, output);
  }

  return output;
}

/**
 * @function embedFromTokenTensor
 * @description Creates an embedding from the GGUF model's actual token tensor.
 * @param {object} engine - Initialized direct engine.
 * @param {string} text - Text to embed.
 * @param {object} [options] - Embedding options.
 * @param {number} [options.dimensions] - Optional output dimensions.
 * @returns {Float32Array} Normalized vector.
 */
function embedFromTokenTensorSync(engine, text, options = {}) {
  if (!options.tokenPoolingOnly && engine.params && String(engine.params.arch || '').includes('bert') && engine.loader.layerTensorMap[0] && engine.loader.layerTensorMap[0].attn_q) {
    const { embedBert } = require('./bertEmbedding.js');
    return embedBert(engine, text, options);
  }
  if (!engine || !engine.loader || !engine.tokenizer) {
    throw new Error('B"H: initialized direct engine required for GGUF embeddings');
  }

  const tensorName = findTokenEmbeddingName(engine);
  if (!tensorName) throw new Error('B"H: GGUF token embedding tensor not found');

  const info = engine.loader.tensorMap.get(tensorName);
  const tensor = engine.loader.getTensor(tensorName);
  if (!tensor) throw new Error(`B"H: GGUF token tensor could not be read: ${tensorName}`);

  const tokens = tokenizeReady(engine.tokenizer, text).filter((n) => Number.isFinite(n));
  const vocabSize = Math.max(engine.vocab.length, 1);
  const shape = rowShape(info, vocabSize);
  const width = Math.min(options.dimensions || options.dim || shape.width, shape.width);
  const out = new Float32Array(width);
  let count = 0;

  for (const rawToken of tokens.length ? tokens : [0]) {
    const token = Math.abs(rawToken | 0) % shape.rows;
    for (let i = 0; i < width; i++) {
      const offset = shape.rowMajor ? token * shape.width + i : i * shape.rows + token;
      out[i] += tensor[offset] || 0;
    }
    count++;
  }

  const scale = 1 / Math.max(count, 1);
  for (let i = 0; i < out.length; i++) out[i] *= scale;
  return normalize(out);
}

async function embedFromTokenTensor(engine, text, options = {}) {
  return embedFromTokenTensorSync(engine, text, options);
}

module.exports = { embedFromTokenTensor, embedFromTokenTensorSync, normalize };
