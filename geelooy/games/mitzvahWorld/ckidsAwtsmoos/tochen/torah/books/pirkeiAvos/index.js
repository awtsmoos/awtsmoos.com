/**
 * B"H
 * @file index.js — Pirkei Avos Master Aggregator
 * All 6 chapters unified into a single holy collection.
 */
import { AVOS_CH1 } from './ch1.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH2 } from './ch2.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH3 } from './ch3.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH4 } from './ch4.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH5 } from './ch5.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { AVOS_CH6 } from './ch6.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export const PIRKEI_AVOS_ALL = [
    ...AVOS_CH1,
    ...AVOS_CH2,
    ...AVOS_CH3,
    ...AVOS_CH4,
    ...AVOS_CH5,
    ...AVOS_CH6
];

export { AVOS_CH1, AVOS_CH2, AVOS_CH3, AVOS_CH4, AVOS_CH5, AVOS_CH6 };

export const AVOS_BY_CHAPTER = {
    1: AVOS_CH1, 2: AVOS_CH2, 3: AVOS_CH3,
    4: AVOS_CH4, 5: AVOS_CH5, 6: AVOS_CH6
};

export const AVOS_BY_ID = Object.fromEntries(
    PIRKEI_AVOS_ALL.map(p => [p.id, p])
);
