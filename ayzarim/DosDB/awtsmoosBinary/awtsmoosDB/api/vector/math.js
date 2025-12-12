
// B"H
function l2(a, b) {
    let sum = 0;
    const len = a.length;
    let i = 0;
    // B"H: Loop Unrolling
    for (; i <= len - 4; i += 4) {
        const d0 = a[i] - b[i];
        const d1 = a[i+1] - b[i+1];
        const d2 = a[i+2] - b[i+2];
        const d3 = a[i+3] - b[i+3];
        sum += d0*d0 + d1*d1 + d2*d2 + d3*d3;
    }
    for (; i < len; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

function cosine(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    const len = a.length;
    let i = 0;
    
    // B"H: Loop Unrolling
    for (; i <= len - 4; i += 4) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];

        dot += a[i+1] * b[i+1];
        magA += a[i+1] * a[i+1];
        magB += b[i+1] * b[i+1];

        dot += a[i+2] * b[i+2];
        magA += a[i+2] * a[i+2];
        magB += b[i+2] * b[i+2];

        dot += a[i+3] * b[i+3];
        magA += a[i+3] * a[i+3];
        magB += b[i+3] * b[i+3];
    }
    
    for (; i < len; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    
    if (magA === 0 || magB === 0) return 1; 
    return 1 - (dot / (Math.sqrt(magA) * Math.sqrt(magB)));
}

function dot(a, b) {
    let sum = 0;
    const len = a.length;
    let i = 0;
    for (; i <= len - 4; i += 4) {
        sum += a[i] * b[i];
        sum += a[i+1] * b[i+1];
        sum += a[i+2] * b[i+2];
        sum += a[i+3] * b[i+3];
    }
    for (; i < len; i++) sum += a[i] * b[i];
    return -sum; 
}

module.exports = {
    l2,
    cosine,
    dot,
    getMetric(name) {
        switch (name) {
            case 'cosine': return cosine;
            case 'dot': return dot;
            default: return l2;
        }
    }
};
