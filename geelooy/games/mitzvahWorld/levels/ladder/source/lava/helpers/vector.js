// B"H
/**
 * @file vector.js
 * @description Chapter 576: Tiny number vessels for hand-authored lava levels.
 */
export const r = value => Number(Number(value).toFixed(3));
export const v3 = (x, y, z) => ({ x: r(x), y: r(y), z: r(z) });
export const topOf = platform => r(platform.position.y + platform.height / 2);
