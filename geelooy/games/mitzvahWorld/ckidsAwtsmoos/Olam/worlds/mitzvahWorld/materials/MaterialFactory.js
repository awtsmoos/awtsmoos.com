/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE REPOSITORY OF APPEARANCES — MaterialFactory.js
 *   ──────────────────────────────────────────────────
 *   In the world of Atzilut, colors and forms are pure emanations.
 *   This factory draws those emanations down into Briyah (Creation),
 *   forming the textures and materials that give our world its beauty.
 *
 *   "And you shall make it of pure gold..." (Shemos 25:11).
 *   Here we define the gold, the wood, the stone, and the glass.
 * ════════════════════════════════════════════════════════════════════════
 * @module MaterialFactory
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * @constant {Object} MATERIALS
 * @description The ledger of all sacred materials.
 */
export const MATERIALS = {
  // ── Jerusalem Stone (The holy foundation) ──
  JERUSALEM_STONE: new THREE.MeshLambertMaterial({ color: 0xfcf5e5 }),
  
  // ── Red Brick (Strength and boundary) ──
  RED_BRICK: new THREE.MeshLambertMaterial({ color: 0x8b0000 }),
  
  // ── Dark Wood (Warmth and kindness) ──
  DARK_WOOD: new THREE.MeshLambertMaterial({ color: 0x5d4037 }),
  
  // ── Sky Glass (Clarity and vision) ──
  SKY_GLASS: new THREE.MeshLambertMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  }),
  
  // ── Steel/Metal (Industry and purpose) ──
  METAL: new THREE.MeshPhongMaterial({ color: 0x607d8b, shininess: 30 }),
  
  // ── Golden Glow (Keter/Crown) ──
  GOLD: new THREE.MeshStandardMaterial({ 
    color: 0xffd700, 
    metalness: 0.8, 
    roughness: 0.2 
  }),

  // ── Verdant Leaves (Growth and renewal) ──
  LEAVES: new THREE.MeshLambertMaterial({ 
    vertexColors: true,
    side: THREE.DoubleSide
  }),

  // ── Radiant Flare (The light of the sun) ──
  FLARE: new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  })
};

/**
 * @function getMaterial
 * @param {string} name - The key in the MATERIALS ledger
 * @param {Object} [overrides={}] - Potential overrides for color/opacity
 * @returns {THREE.Material}
 */
export function getMaterial(name, overrides = {}) {
  const base = MATERIALS[name] || MATERIALS.JERUSALEM_STONE;
  const clone = base.clone();
  if (overrides.color) clone.color.set(overrides.color);
  if (overrides.opacity !== undefined) {
    clone.transparent = true;
    clone.opacity = overrides.opacity;
  }
  return clone;
}
