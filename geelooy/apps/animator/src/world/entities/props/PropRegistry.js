
// B"H
import { CupProp } from './definitions/CupProp.js';
import { ScissorsProp } from './definitions/ScissorsProp.js';
import { SwordProp } from './definitions/SwordProp.js';
import { PhoneProp } from './definitions/PhoneProp.js';
import { BookProp } from './definitions/BookProp.js';
import { FrisbeeProp } from './definitions/FrisbeeProp.js';
import { BillboardProp } from './definitions/BillboardProp.js';
import { ChairProp } from './definitions/ChairProp.js';
import { WagonProp } from './definitions/WagonProp.js';
import { NestedSceneProp } from './definitions/NestedSceneProp.js';
import { ToothbrushProp } from './definitions/ToothbrushProp.js';
import { PlantProp } from './definitions/PlantProp.js';

/**
 * @file PropRegistry.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 31: THE LIBRARY OF INANIMATE VESSELS (Sifriyat HaKelim)
 * ═══════════════════════════════════════════════════════════════
 */
export const PropRegistry = {
  map: {
    'cup': CupProp,
    'scissors': ScissorsProp,
    'sword': SwordProp,
    'phone': PhoneProp,
    'book': BookProp,
    'holy_book': BookProp,
    'frisbee': FrisbeeProp,
    'billboard': BillboardProp,
    'chair': ChairProp,
    'wagon': WagonProp,
    'nested_painting': NestedSceneProp,
    'toothbrush': ToothbrushProp,
    'plant': PlantProp
  },

  get(type) {
    return this.map[type] || null;
  }
};
