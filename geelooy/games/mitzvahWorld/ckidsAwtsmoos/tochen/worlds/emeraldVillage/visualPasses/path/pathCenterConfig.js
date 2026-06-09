// B"H
/** @file pathCenterConfig.js @description Chapter 424: The main path gains a centerline of hand-placed cobbles. */
export const PATH_CENTER_STONES = Object.freeze(Array.from({ length: 30 }, (_, i) => Object.freeze({ id: `entry_path_center_cobble_${i}`, x: 0, z: 4 - i * 0.82, y: 0.23, size: [1.1 + (i % 3) * 0.12, 0.15, 0.62] })));
