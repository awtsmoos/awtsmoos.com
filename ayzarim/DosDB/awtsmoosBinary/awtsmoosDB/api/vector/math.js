
// B"H
function l2(a, b) {
    let sum = 0; const len = a.length;
    for (let i = 0; i <= len - 4; i += 4) {
        const d0 = a[i] - b[i], d1 = a[i+1] - b[i+1], d2 = a[i+2] - b[i+2], d3 = a[i+3] - b[i+3];
        sum += d0*d0 + d1*d1 + d2*d2 + d3*d3;
    }
    for (let i = (len - (len % 4)); i < len; i++) { const d = a[i] - b[i]; sum += d * d; }
    return Math.sqrt(sum);
}

function cosine(a, b) {
    let dot = 0, mA = 0, mB = 0; const len = a.length;
    for (let i = 0; i < len; i++) {
        dot += a[i] * b[i]; mA += a[i] * a[i]; mB += b[i] * b[i];
    }
    return mA === 0 || mB === 0 ? 1 : 1 - (dot / (Math.sqrt(mA) * Math.sqrt(mB)));
}

module.exports = {
    l2, cosine, getMetric(n) { return n === 'cosine' ? cosine : l2; }
};
