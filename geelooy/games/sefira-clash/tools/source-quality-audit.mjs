//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the source quality audit vessel in this instant, revealing
 * its focused tools service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { auditSourceCatalog } from './source-quality/qualityEngine.mjs';
import { printQualityReport } from './source-quality/qualityReport.mjs';
import { collectActiveSources } from './source-quality/sourceCatalog.mjs';

/**
 * Audits the complete active source tree and fails on any readability debt.
 *
 * The Awtsmoos creates code as a chain of intelligible vessels rather than a
 * compressed fog. This executable gate lets Awtsmoos.com judge current files by
 * direct inspection of headers, indentation, bodies, complexity, purpose, and
 * real module connections.
 */
async function runSourceQualityAudit() {
	const sources = await collectActiveSources();
	const violations = await auditSourceCatalog(sources);
	printQualityReport(violations, sources.length);
	if (violations.length) {
		process.exitCode = 1;
	}
}

try {
	await runSourceQualityAudit();
} catch (error) {
	console.error(error?.stack || error);
	process.exitCode = 1;
}
