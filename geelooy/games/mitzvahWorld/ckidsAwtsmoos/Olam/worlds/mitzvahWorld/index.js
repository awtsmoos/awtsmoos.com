/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 * THE MITZVAH WORLD ENTRY — index.js
 * The world-specific entry point called by the Olam dispatcher.
 *
 * Through this gate the Awtsmoos lets the hosted ground, the village, and the
 * running chossid enter one living scene. The cache-bust on WorldHeescheel is
 * part of the vessel: without it, the browser may cling to yesterday's terrain.
 * ════════════════════════════════════════════════════════════════════════
 */
import { WorldHeescheel } from './WorldHeescheel.js?compact=true&v=hosted-ground-textures-20260708-bh1';

export async function heescheel(ctx) {
  const worldBuilder = new WorldHeescheel({
    scene:ctx.scene,
    physics:ctx.physics || null,
    postMsg:ctx.postMsg,
    olam:ctx.olam || null
  });
  await worldBuilder.execute();
}

export function ready(ctx) {
  ctx.postMsg({ type:'game started', payload:true });
}

export function afterBriyah(ctx) {}

export * from './runtime/MitzvahWorldRuntimeSystems.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
