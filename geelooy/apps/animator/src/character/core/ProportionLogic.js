
/**
 * @file ProportionLogic.js
 * @description
 * THE SCIENCE OF SHIUR KOMA (Measurements of Height).
 * B"H
 * Provides a data-driven system to adjust the scale of body parts based 
 * on the character's archetype. Ensures 'Messy' overlapping is impossible 
 * by calculating rigid anchors.
 */

// B"H
import { GIANT_SOUL } from '../data/archetypes/Giant.js';
import { DWARF_SOUL } from '../data/archetypes/Dwarf.js';
import { ALIEN_SOUL } from '../data/archetypes/Alien.js';
import { CHILD_SOUL } from '../data/archetypes/Child.js';
import { ELDER_SOUL } from '../data/archetypes/Elder.js';
import { ADULT_SOUL } from '../data/archetypes/Adult.js';

export class ProportionLogic {
  static get(archetype = 'adult') {
    switch (archetype) {
      case 'giant': return GIANT_SOUL;
      case 'dwarf': return DWARF_SOUL;
      case 'alien': return ALIEN_SOUL;
      case 'kid':   return CHILD_SOUL;
      case 'elder': return ELDER_SOUL;
      default:      return ADULT_SOUL;
    }
  }
}
