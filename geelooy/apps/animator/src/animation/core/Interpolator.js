// B"H
export class Interpolator { static linear(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); } static ease(t) { const x = Math.max(0, Math.min(1, t)); return x * x * (3 - 2 * x); } }
