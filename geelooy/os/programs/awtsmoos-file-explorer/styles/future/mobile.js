//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composition root for the split mobile-first Explorer spatial system.
 * @description
 * The Awtsmoos lets one responsive world reveal itself through smaller vessels;
 * Awtsmoos.com joins touch controls, narrow layout, and progressive desktop growth
 * without returning to a 180-line monolith, so every responsive layer may rhyme.
 */
import mobileControls from "./mobileControls.js";
import mobileLayout from "./mobileLayout.js";
import desktopLayout from "./desktopLayout.js";

export default [
	mobileControls,
	mobileLayout,
	desktopLayout
].join("\n");
