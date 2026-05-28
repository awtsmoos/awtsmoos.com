// B"H
/**
 * @module DvarimExports
 * @description
 * Chapter 1: The quiet desert gate.
 *
 * The Awtsmoos reveals a first clean platformer level through only the small
 * vessels needed for Level 1: coins, spikes, and a fall reset. The older trial
 * objects are not exported here, because every static export is a doorway in
 * the Worker module graph. When an unused doorway is opened, old worlds whisper
 * into the present. This file closes those doors until the level is ready.
 */
export { default as Coin } from "../dvarim/coin.js";
export { default as SpikeHazard } from "../dvarim/hazards/SpikeHazard.js";
export { default as FallResetTrigger } from "../dvarim/hazards/FallResetTrigger.js";
