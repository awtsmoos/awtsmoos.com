// B"H
export function dotProduct(vecA, vecB) {
    let sum = 0;
    for(let i=0; i<vecA.length; i++) sum += vecA[i] * vecB[i];
    return sum;
}

export function matVecMul(x, w, n_out) {
    const n_in = x.length;
    const y = new Float32Array(n_out);
    
    // Safety
    if (w.length !== n_out * n_in) return y;

    for (let i = 0; i < n_out; i++) {
        let sum = 0;
        const offset = i * n_in;
        for (let j = 0; j < n_in; j++) sum += w[offset + j] * x[j];
        y[i] = sum;
    }
    return y;
}

export function addInPlace(a, b) {
    for(let i=0; i<a.length; i++) a[i] += b[i];
}

export function mul(a, b) {
    const out = new Float32Array(a.length);
    for(let i=0; i<a.length; i++) out[i] = a[i] * b[i];
    return out;
}