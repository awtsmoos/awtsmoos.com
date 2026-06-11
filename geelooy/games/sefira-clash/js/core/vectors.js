/** B"H — vectors carry will through space, a kav drawn into a canvas world. */
export const v = (x = 0, y = 0) => ({ x, y });
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const sign = n => n < 0 ? -1 : 1;
