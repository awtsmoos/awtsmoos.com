
// B"H
export const MathActSource = () => {
    
    self.softCap = (x, cap) => {
        if (!cap || cap <= 0) return x;
        const out = new Float32Array(x.length);
        const invCap = 1.0 / cap;
        for (let i = 0; i < x.length; i++) {
            out[i] = cap * Math.tanh(x[i] * invCap);
        }
        return out;
    };

    self.gelu = (x) => {
        const out = new Float32Array(x.length);
        const COEF = 0.044715;
        const SQRT_2_PI = 0.7978845608;

        for (let i = 0; i < x.length; i++) {
            const v = x[i];
            const v3 = v * v * v;
            out[i] = 0.5 * v * (1.0 + Math.tanh(SQRT_2_PI * (v + COEF * v3)));
        }
        return out;
    };
};
