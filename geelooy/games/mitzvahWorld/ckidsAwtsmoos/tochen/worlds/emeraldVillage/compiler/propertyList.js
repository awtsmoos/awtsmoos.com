// B"H
/** @file propertyList.js @description Chapter 363: Base and island properties become one array. */
import { PROPERTY_LAYOUTS } from '../propertyLayouts.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { ISLAND_PROPERTIES } from '../scatteredNature.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export function baseProperties() { return [...PROPERTY_LAYOUTS, ...ISLAND_PROPERTIES]; }
