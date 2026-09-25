//B"H
// Boruch Hashem
// Blessed is He
import fs from 'node:fs';

/** Emits visible progress so a stuck auditor can never look like a silent product failure. */
export function progress(message, stream = process.stderr) {
	stream.write(`AUDIT_PROGRESS ${message}\n`);
}

/** Writes a non-empty machine-readable report atomically enough for local verification work. */
export function writeReport(path, report) {
	const body = `${JSON.stringify(report, null, 2)}\n`;
	if (body.trim().length < 3) throw new Error('AUDIT_REPORT empty output');
	fs.writeFileSync(path, body);
	return body.length;
}
