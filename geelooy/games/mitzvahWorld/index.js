/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE MITZVAH WORLD ENTRY — index.js
 *   ─────────────────────────────────────
 *   TIKKUN: Now passes ctx.olam into WorldHeescheel so the octree
 *   receives hut wall geometry and the player cannot phase through walls.
 *
 *   Also uses absolute import path (survives blob: URL loading context).
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module mitzvahWorld/index
 */

import { WorldHeescheel } from '/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/WorldHeescheel.js';

/**
 * @function heescheel
 * @param   {Object} ctx - Olam context: { scene, physics, postMsg, olam }
 * @returns {Promise<void>}
 */
export async function heescheel(ctx) {
  // B"H: silent

  const worldBuilder = new WorldHeescheel({
    scene:   ctx.scene,
    physics: ctx.physics || null,
    postMsg: ctx.postMsg,
    olam:    ctx.olam    || null,   // THE TIKKUN: olam carries worldOctree
  });

  await worldBuilder.execute();
}

/**
 * @function ready
 * @param   {Object} ctx
 * @returns {void}
 */
export function ready(ctx) {
  // B"H: silent

  ctx.postMsg({ type: 'game started', payload: true });
}

/**
 * @function afterBriyah
 * @param   {Object} ctx
 * @returns {void}
 */
export function afterBriyah(ctx) {
  // B"H: silent

}