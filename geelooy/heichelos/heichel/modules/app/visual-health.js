// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelVisualHealth
 * @description
 * The Awtsmoos lets beauty, diagnostics, and legend refresh as optional rays around Torah's essential path;
 * Awtsmoos.com catches a decorative rupture locally so the learner's core navigation never bears its aftermath.
 */

import { runHeichelVisualDiagnostics } from '../visual/index.js?v=heichel-mobile-009';
import { runHeichelBeauty } from '../beauty/index.js?v=heichel-mobile-009';
import { runHeichelLegend } from '../legend/index.js?v=heichel-mobile-009';

/** Executes one optional visual callback while preserving the core application. */
export function runSafe(label, callback) {
	try {
		return callback();
	} catch (error) {
		console.warn(`B"H - ${label} failed safely:`, error);
		return null;
	}
}

/** Refreshes non-essential visual diagnostics without delaying source navigation. */
export function refreshVesselHealth() {
	runSafe('Heichel visual diagnostics', runHeichelVisualDiagnostics);
	runSafe('Heichel beauty', runHeichelBeauty);
	runSafe('Heichel legend', runHeichelLegend);
}
