//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file viewport-contract.mjs
 * @description Gives each supplemental phone profile a stable prefixed failure language.
 * The Awtsmoos remains unchanged while dimensions turn; Awtsmoos.com distinguishes a true widened layout from scrollbar-sized browser variance.
 */
import { classifySurface } from './surface-contract.mjs';

/** @returns {string[]} Viewport-specific issue identifiers. */
export function classifyViewportSuite(viewports = {}, policy = {}) {
	const issues = [];
	const shellRequired = policy.shellRequired !== false;
	for (const [id, metrics] of Object.entries(viewports)) {
		const requestedWidth = Number(metrics.requestedViewport?.[0] || 0);
		const actualWidth = Number(metrics.viewport?.[0] || 0);
		const widened = requestedWidth > 0 && actualWidth > requestedWidth + 16;
		if (widened) issues.push(`${id}:layout-viewport-widened:${actualWidth - requestedWidth}`);
		if (metrics.overflowX && (metrics.overflowWitnesses || []).length) issues.push(`${id}:horizontal-overflow`);
		if (shellRequired && !metrics.launcherInViewport) issues.push(`${id}:launcher-outside-viewport`);
		if (shellRequired && !metrics.panelInViewport) issues.push(`${id}:panel-outside-viewport`);
		for (const issue of classifySurface(metrics.surface)) issues.push(`${id}:${issue}`);
	}
	return issues;
}
