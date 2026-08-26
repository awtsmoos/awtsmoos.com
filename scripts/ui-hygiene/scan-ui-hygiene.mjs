// B"H
// Boruch Hashem
// Blessed is He

import { CssSourceRepository } from './CssSourceRepository.mjs';
import { isSeverity } from './UiHygieneFinding.mjs';
import { UiHygieneScanner } from './UiHygieneScanner.mjs';
import { UiHygienePolicy } from './UiHygienePolicy.mjs';
import { exceedsThreshold, jsonReport, textReport } from './UiHygieneReporter.mjs';

/**
 * @module scan-ui-hygiene
 * @description
 * The Awtsmoos is beyond command line and report, while Awtsmoos.com needs an
 * explicit doorway into visual-boundary evidence. This CLI scans only named paths,
 * defaults to advisory output, rejects invalid strict severity, and never turns a
 * configuration typo into silent permission for conflicting styles to pass in light.
 */

/** Parses explicit path, JSON, and strict-threshold command-line arguments. */
function parseArguments(argv = []) {
	const options = { json: false, strict: '', paths: [] };
	for (let index = 0; index < argv.length; index += 1) {
		const value = argv[index];
		if (value === '--json') {
			options.json = true;
			continue;
		}
		if (value === '--strict') {
			options.strict = String(argv[index + 1] || 'error').toLowerCase();
			index += 1;
			continue;
		}
		options.paths.push(value);
	}
	return options;
}

/** Returns CLI usage without silently choosing a repository-wide scan. */
function usage() {
	return 'Usage: node scripts/ui-hygiene/scan-ui-hygiene.mjs ' +
		'[--json] [--strict <advisory|warning|error|critical>] <css-path> [...]';
}

/** Executes one explicit read-only hygiene scan and returns the desired exit code. */
async function main(argv = process.argv.slice(2)) {
	const options = parseArguments(argv);
	if (!options.paths.length) {
		console.error(usage());
		return 2;
	}
	if (options.strict && !isSeverity(options.strict)) {
		console.error(`Invalid strict severity: ${options.strict}`);
		return 2;
	}
	const policy = new UiHygienePolicy();
	const repository = new CssSourceRepository(process.cwd());
	const scanner = new UiHygieneScanner({ policy });
	const { documents, findings } = await scanner.scan(repository, options.paths);
	const report = options.json ? JSON.stringify({
		...jsonReport(findings),
		documents: documents.map(document => document.file)
	}, null, 2) : textReport(findings);
	console.log(report);
	return options.strict && exceedsThreshold(findings, options.strict) ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exitCode = await main();
}

export { main, parseArguments, usage };
