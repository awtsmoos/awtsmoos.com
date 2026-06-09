// B"H
/**
 * @file etzChayimLanterns.js
 * @description Chapter 277: Lanterns hang like mitzvah sparks from the boughs,
 * making the tree visible even before the UI speaks.
 */
import { box, p } from './shapeKit.js';
import { P } from './palette.js';
export function addEtzChayimLanterns(n, config) {
  for (let i = 0; i < config.lanternCount; i += 1) {
    const a = i / config.lanternCount * Math.PI * 2;
    const radius = 6.2 + (i % 4) * 0.65;
    box(n, `etz_lantern_${i}`, 'Hanging golden lantern', p(Math.cos(a) * radius, 5.5 + (i % 7) * 0.45, config.center.z + Math.sin(a) * radius), [0.32, 0.52, 0.32], P.light, false);
  }
}
