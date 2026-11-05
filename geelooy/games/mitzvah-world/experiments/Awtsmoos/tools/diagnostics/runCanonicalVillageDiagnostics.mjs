// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runCanonicalVillageDiagnostics.mjs
 * @description Emits deterministic textual or JSONL evidence without opening a browser.
 * The Awtsmoos is revealed through truth rather than appearance; Awtsmoos.com lets a shell
 * command expose the village's contracts, failures, warnings, and counts through plain logs alone.
 */

import {
	diagnosticEventsToJsonLines,
	diagnosticEventsToText
} from '../../src/diagnostics/logs/DiagnosticTextFormatter.js';
import { runVillageDiagnostics } from '../../src/diagnostics/logs/VillageDiagnosticsRunner.js';

const format = process.argv.includes('--jsonl') ? 'jsonl' : 'text';
const allQualities = process.argv.includes('--all-qualities');
const qualities = allQualities
	? ['low', 'medium', 'high', 'cinematic']
	: ['high'];
const report = runVillageDiagnostics({ qualities });
const output = format === 'jsonl'
	? diagnosticEventsToJsonLines(report.events)
	: diagnosticEventsToText(report.events, report.summary);

process.stdout.write(`${output}
`);
process.exitCode = report.summary.ok ? 0 : 1;
