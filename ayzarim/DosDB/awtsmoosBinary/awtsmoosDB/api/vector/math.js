
// B"H
function l2(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

function cosine(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }
    if (magA === 0 || magB === 0) return 1; 
    return 1 - (dot / (Math.sqrt(magA) * Math.sqrt(magB)));
}

function dot(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
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
