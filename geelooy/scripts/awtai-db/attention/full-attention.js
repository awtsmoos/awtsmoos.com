// B"H
const { softmaxInPlace } = require('./softmax.js');
function attend(q, pages, config) {
  const out = new Float32Array(config.hidden);
  const scale = 1 / Math.sqrt(config.headDim);
  for (let h = 0; h < config.heads; h++) {
    const kvHead = Math.floor(h / config.kvGroup);
    const scores = new Float32Array(pages.length);
    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      let dot = 0;
      const qo = h * config.headDim;
      const ko = kvHead * config.headDim;
      for (let d = 0; d < config.headDim; d++) dot += q[qo + d] * page.k[ko + d];
      scores[p] = dot * scale;
    }
    softmaxInPlace(scores);
    const oo = h * config.headDim;
    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      const vo = kvHead * config.headDim;
      const w = scores[p];
      for (let d = 0; d < config.headDim; d++) out[oo + d] += w * page.v[vo + d];
    }
  }
  return out;
}
module.exports = { attend };
