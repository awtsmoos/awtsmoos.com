// B"H

/**
 * @file api/ai/embeddings.js
 * @chapter The Small Lamp For Search Before The Giant Wakes
 * @description
 * Deterministic lightweight embeddings used as a no-dependency fallback while
 * GGUF model loading/parsing prepares real model metadata.
 */

/**
 * @function embedText
 * @description Creates a normalized hashed embedding.
 * @param {string} text - Source text.
 * @param {number} [dim=384] - Embedding dimensions.
 * @returns {Float32Array} Vector.
 */
function embedText(text, dim = 384) {
  const out = new Float32Array(dim);
  const words = String(text || '').toLowerCase().match(/[a-z0-9_]+/g) || [];

  for (const word of words) {
    const h1 = hash(word);
    const h2 = hash(reverse(word));
    out[Math.abs(h1) % dim] += 1;
    out[Math.abs(h2) % dim] += h1 < 0 ? -0.5 : 0.5;
  }

  let mag = 0;
  for (let i = 0; i < out.length; i++) mag += out[i] * out[i];
  mag = Math.sqrt(mag) || 1;
  for (let i = 0; i < out.length; i++) out[i] /= mag;
  return out;
}

/**
 * @function hash
 * @param {string} text - Text.
 * @returns {number} Hash.
 */
function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

/**
 * @function reverse
 * @param {string} text - Text.
 * @returns {string} Reversed text.
 */
function reverse(text) {
  return text.split('').reverse().join('');
}

module.exports = { embedText };
