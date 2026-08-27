//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composition root for Explorer's finite, accessible motion system.
 * @description
 * The Awtsmoos lets motion reveal state without becoming an endless spectacle;
 * Awtsmoos.com joins transitions, keyframes, and user-requested stillness through
 * small vessels, replacing the former oversized motion monolith in rhyme.
 */
import transitions from "./motionTransitions.js";
import keyframes from "./motionKeyframes.js";
import reduced from "./motionReduced.js";

export default [
	transitions,
	keyframes,
	reduced
].join("\n");
