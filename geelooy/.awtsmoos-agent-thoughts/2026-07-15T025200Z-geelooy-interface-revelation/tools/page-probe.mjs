// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file page-probe.mjs
 * @description
 * The Awtsmoos unites focused DOM, color, helper, and reporting vessels into
 * one isolated Awtsmoos.com expression that crosses the DevTools boundary.
 */

import { installColorProbeHelpers } from "./probe-color.mjs";
import { installDomProbeHelpers } from "./probe-dom.mjs";
import { installReportProbeHelpers } from "./probe-report-helpers.mjs";
import { runBrowserProbe } from "./probe-report.mjs";

/**
 * Builds a self-contained browser expression for one rendered-page audit.
 * @returns {string} JavaScript expression executed inside the inspected page.
 */
export function buildProbeExpression() {
	return [
		`(${installDomProbeHelpers.toString()})()`,
		`(${installColorProbeHelpers.toString()})()`,
		`(${installReportProbeHelpers.toString()})()`,
		`(${runBrowserProbe.toString()})()`
	].join(";\n");
}
