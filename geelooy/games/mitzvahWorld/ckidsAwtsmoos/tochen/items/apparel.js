/**
 * B"H
 * @file apparel.js
 * @description MASTER APPAREL AGGREGATOR
 */
import { YAMULKAS } from './apparel/head/yamulkas.js';
import { HATS }     from './apparel/head/hats.js';
import { JACKETS }  from './apparel/torso/jackets.js';
import { SHIRTS }   from './apparel/torso/shirts.js';
import { PANTS }    from './apparel/legs/pants.js';
import { SHOES }    from './apparel/feet/shoes.js';
import { GARTELS }  from './apparel/accessories/gartels.js';

export const APPAREL_REGISTRY = {
    ...YAMULKAS,
    ...HATS,
    ...JACKETS,
    ...SHIRTS,
    ...PANTS,
    ...SHOES,
    ...GARTELS
};

export const APPAREL_LIST = Object.values(APPAREL_REGISTRY);
