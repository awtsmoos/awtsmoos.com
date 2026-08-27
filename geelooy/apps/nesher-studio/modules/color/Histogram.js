/* B"H */
export function createHistogram(input = {}) { return { kind:'Histogram', bins:input.bins || 256, r:new Array(input.bins || 256).fill(0), g:new Array(input.bins || 256).fill(0), b:new Array(input.bins || 256).fill(0), luma:new Array(input.bins || 256).fill(0) }; }
export function buildHistogram(pixels = [], bins = 256) { const h = createHistogram({ bins }); for (const p of pixels) { const r=bin(p[0], bins), g=bin(p[1], bins), b=bin(p[2], bins), y=bin(.2126*p[0]+.7152*p[1]+.0722*p[2], bins); h.r[r]++; h.g[g]++; h.b[b]++; h.luma[y]++; } return h; }
function bin(v, bins) { return Math.max(0, Math.min(bins - 1, Math.round(v * (bins - 1) / 255))); }
