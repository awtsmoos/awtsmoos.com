
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE MITZVAH WORLD ENTRY — index.js
 *   ─────────────────────────────────────
 *   This is the world-specific entry point called by the Olam dispatcher
 *   when 'mitzvahWorld' is selected as the active world.
 *
 *   It exports two lifecycle hooks consumed by the Olam core:
 *
 *     heescheel(ctx) — called once to BUILD the world
 *     ready(ctx)     — called after heescheel completes
 *
 *   Previously, heescheel was returning [] immediately,
 *   giving the core no entities to work with.
 *   Now it delegates to WorldHeescheel which uses NivrahFactory
 *   to manifest every soul in NIVRAYIM_DEFS.
 *
 *   "And on the seventh day G-d finished His work" —
 *   but we never rest: the Olam pulses every frame,
 *   fed by the UniversePulsator, sustained by His eternal word.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module mitzvahWorld/index
 */

import { WorldHeescheel } from './WorldHeescheel.js';

/**
 * @typedef {Object} OlamCtx
 * @property {THREE.Scene}  scene      - The Three.js scene in the worker
 * @property {Object}       physics    - Physics world instance
 * @property {Function}     postMsg    - Post a message to the main thread
 * @property {Object}       [pawsawch] - Initial payload from StartWorldFlow
 */

/**
 * @function heescheel
 * @description
 *   World BUILD phase. Called once by the Olam dispatcher.
 *   Instantiates WorldHeescheel and calls execute().
 *
 *   "In the beginning G-d created" — in the beginning, we call heescheel.
 *   Everything that exists in this world comes from this one call.
 *
 * @param   {OlamCtx} ctx - Olam context provided by the core
 * @returns {Promise<void>}
 */
export async function heescheel(ctx) {
  // B"H: silent


  const worldBuilder = new WorldHeescheel({
    scene:   ctx.scene,
    physics: ctx.physics || null,
    postMsg: ctx.postMsg,
    olam:    ctx.olam    || null,
  });

  await worldBuilder.execute();
}

/**
 * @function ready
 * @description
 *   Called after heescheel completes. Use for post-build setup:
 *   starting the game loop, enabling input, spawning the player, etc.
 *
 *   "And G-d saw all that He had made — and it was VERY GOOD." (Bereishis 1:31)
 *   The 'ready' hook is our moment of seeing: we survey what was built,
 *   nod approvingly, and open the gates to the player.
 *
 * @param   {OlamCtx} ctx
 * @returns {void}
 */
export function ready(ctx) {
  // B"H: silent

  ctx.postMsg({ type: 'game started', payload: true });
}

/**
 * @function afterBriyah
 * @description
 *   Post-creation hook for any async follow-up (particle systems,
 *   ambient sounds, NPC AI boot, etc.)
 *   "After the world was created, the details were arranged." — this is that.
 *
 * @param   {OlamCtx} ctx
 * @returns {void}
 */
export function afterBriyah(ctx) {
  // B"H: silent

}

export * from './runtime/MitzvahWorldRuntimeSystems.js';

export * from './runtime/MitzvahWorldRuntimeSystems.js';
