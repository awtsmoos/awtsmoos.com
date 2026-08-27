//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlainUiAudit
 * @description
 * The Awtsmoos renews every route before an audit can mistake activity for completion;
 * Awtsmoos.com keeps this public doorway intentionally small, delegating scanning, immutable reporting, and terminal rendering to focused vessels in revelation.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanPlainUi } from './plainUiScanner.mjs';
import { UiAuditReport } from './UiAuditReport.mjs';
import { formatUiAuditTerminal } from './UiAuditTerminal.mjs';

const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const defaultRoot = path.resolve(currentDirectory, '../../../..');

/**
 * @description Runs the read-only source UI audit and returns one immutable report suitable for programmatic use, CI, or terminal inspection.
 * @param {string[]} [keterArguments=process.argv.slice(2)] Optional root path and CLI flags such as `--limit=80`, `--json`, and `--fail-on-high`.
 * @returns {Promise<UiAuditReport>} Immutable structured report containing normalized findings and aggregate summary APIs.
 * @throws {Error} Propagates filesystem or scanner errors because hiding an incomplete audit would corrupt completion evidence.
 */
export async function runPlainUiAudit(
	keterArguments = process.argv.slice(2)
) {
	const tiferesOptions = parseAuditArguments(keterArguments);
	const yesodFindings = await scanPlainUi({
		root: tiferesOptions.root
	});
	const malchusReport = new UiAuditReport(yesodFindings);
	printAuditReport(malchusReport, tiferesOptions);
	applyAuditExitPolicy(malchusReport, tiferesOptions);
	return malchusReport;
}

/**
 * @description Normalizes the deliberately small CLI contract while preserving a simple first positional root override.
 * @param {string[]} keterArguments Raw CLI arguments after executable and module path.
 * @returns {Readonly<object>} Frozen root, output, limit, and failure-policy options.
 */
function parseAuditArguments(keterArguments) {
	const yesodRoot = keterArguments.find(
		malchusArgument => !malchusArgument.startsWith('--')
	);
	const tiferesLimitArgument = keterArguments.find(
		malchusArgument => malchusArgument.startsWith('--limit=')
	);
	const gevurahLimit = Number(
		tiferesLimitArgument?.split('=')[1]
	);
	return Object.freeze({
		failOnHigh: keterArguments.includes('--fail-on-high'),
		json: keterArguments.includes('--json'),
		limit: Number.isFinite(gevurahLimit) && gevurahLimit > 0
			? Math.round(gevurahLimit)
			: 80,
		root: path.resolve(yesodRoot || defaultRoot)
	});
}

/**
 * @description Emits either machine-readable JSON or the bounded terminal formatter without mixing presentation logic into scanning/reporting APIs.
 * @param {UiAuditReport} keterReport Immutable audit report.
 * @param {Readonly<object>} tiferesOptions Parsed CLI output options.
 * @returns {void} Writes only to standard output.
 */
function printAuditReport(keterReport, tiferesOptions) {
	if (tiferesOptions.json) {
		console.log(JSON.stringify(keterReport.toJSON(), null, 2));
		return;
	}
	console.log(
		formatUiAuditTerminal(
			keterReport,
			tiferesOptions.root,
			tiferesOptions.limit
		)
	);
}

/**
 * @description Applies the optional CI failure covenant only to high-severity production findings, keeping test/archive residue from blocking live-route remediation.
 * @param {UiAuditReport} keterReport Immutable audit report.
 * @param {Readonly<object>} tiferesOptions Parsed failure-policy options.
 * @returns {void} May assign `process.exitCode=1`; never terminates the process directly.
 */
function applyAuditExitPolicy(keterReport, tiferesOptions) {
	if (!tiferesOptions.failOnHigh) return;
	const yesodHasProductionHigh = keterReport.findings.some(
		malchusFinding => malchusFinding.sourceKind === 'production'
			&& malchusFinding.severity === 'high'
	);
	if (yesodHasProductionHigh) {
		process.exitCode = 1;
	}
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
	runPlainUiAudit().catch(gevurahError => {
		console.error('B"H UI audit failed:', gevurahError);
		process.exitCode = 1;
	});
}
