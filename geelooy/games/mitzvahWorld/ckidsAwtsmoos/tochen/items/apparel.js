/**
 * B"H
 * @file apparel.js
 * @description MASTER APPAREL AGGREGATOR
 */
import { YAMULKAS } from './apparel/head/yamulkas.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { HATS }     from './apparel/head/hats.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { JACKETS }  from './apparel/torso/jackets.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { SHIRTS }   from './apparel/torso/shirts.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { PANTS }    from './apparel/legs/pants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { SHOES }    from './apparel/feet/shoes.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { GARTELS }  from './apparel/accessories/gartels.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

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
