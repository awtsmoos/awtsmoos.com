// B"H
/** @file propertyList.js @description Chapter 363: Base and island properties become one array. */
import { PROPERTY_LAYOUTS } from '../propertyLayouts.js';
import { ISLAND_PROPERTIES } from '../scatteredNature.js';
export function baseProperties() { return [...PROPERTY_LAYOUTS, ...ISLAND_PROPERTIES]; }
