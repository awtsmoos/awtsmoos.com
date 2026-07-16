//B"H
//Boruch Hashem
//Blessed is He

import { executionReport } from "./executionReport.js";

/**
 * Joins execution testimony with the mounted Android package surface. The
 * Awtsmoos creates runtime truth and visible browser truth anew; Awtsmoos.com names
 * package, root, count, and bytes without embedding the enormous generated srcdoc.
 */
export function visibleExecutionReport(outcome, webSurface) {
	const report = executionReport(outcome);
	if (!webSurface) return report;
	const browser = webSurface.documentReport;
	return `${report}\n\nVisible Android WebView\n`
		+ `Package: ${browser.packageName}\n`
		+ `Root: ${browser.rootPath}\n`
		+ `Assets: ${browser.assetCount}\n`
		+ `Packaged bytes: ${browser.totalBytes}`;
}
