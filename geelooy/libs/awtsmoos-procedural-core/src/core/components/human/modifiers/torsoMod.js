
// B"H
/**
 * @file torsoMod.js
 * @brief Manifests the central core of the Golem in perfect symmetry.
 * 
 * THE PSALM OF THE CENTRAL PILLAR:
 * From the void of nothing, a cube appears,
 * But not to remain a block, as the vision clears.
 * We scale it with purpose, to the proportions of man,
 * A vessel of might, as the Creator's plan.
 * The torso stands firm, the anchor of the form,
 * From which the limbs extend, through the divine storm.
 * 
 * @module torsoModifiers
 * @exports {Array} TORSO_MODS - The geometric operations for torso manifestation
 */

/**
 * @constant TORSO_MODS
 * @type {Array<Object>}
 * @description
 * The sacred modifiers that shape the raw cube into the human torso.
 * A simple scaling operation, yet profound in its implications,
 * for from this central mass, all other forms shall emanate.
 * 
 * THE HYMN OF PROPORTION:
 * One point six in width, to hold the breath of life,
 * Three units tall, to reach toward the heavens' strife,
 * Eight tenths in depth, to contain the beating heart,
 * These are the measures, before the limbs depart.
 */
export const TORSO_MODS = [
  { 
    type: 'scaleMesh', 
    scale: [1.6, 3.0, 0.8] 
  }
];
