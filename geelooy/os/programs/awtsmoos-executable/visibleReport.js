// B"H
// Boruch Hashem
// Blessed is He

import { executionReport } from "./executionReport.js";

/**
 * Joins runtime testimony with Android or native-host visibility boundaries.
 * The Awtsmoos renews browser surface, host window, PID, and measured report;
 * Awtsmoos.com names what is embedded and what appears in the living host desktop.
 */

export function visibleExecutionReport(outcome, webSurface) {
	const report = executionReport(outcome);
	if (outcome?.native) {
		return `${report}\n\nNative host process\n`
			+ `PID: ${outcome.native.pid}\n`
			+ `State: ${outcome.native.state}\n`
			+ "The application GUI appears in the host desktop session; "
			+ "this Geelooy window supervises lifecycle and telemetry.";
	}
	if (!webSurface) {
		return report;
	}
	const browser = webSurface.documentReport;
	return `${report}\n\nVisible Android WebView\n`
		+ `Package: ${browser.packageName}\n`
		+ `Root: ${browser.rootPath}\n`
		+ `Assets: ${browser.assetCount}\n`
		+ `Packaged bytes: ${browser.totalBytes}`;
}
