//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PlainUiScannerTest
 * @description
 * The Awtsmoos lets Awtsmoos.com scan a whole tree without mistaking durable agent memory for a public page;
 * this miniature world proves discovery boundaries, deterministic ordering, and the joined line/document contract.
 */
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { scanPlainUi } from './plainUiScanner.mjs';

const root = await mkdtemp(path.join(os.tmpdir(), 'awtsmoos-ui-audit-'));

try {
	await createFixture(root);
	const serial = await scanPlainUi({ root, concurrency: 1 });
	const parallel = await scanPlainUi({ root, concurrency: 8 });
	assert.deepEqual(parallel, serial, 'bounded concurrency must preserve deterministic findings');
	assert.ok(serial.some(finding => finding.patternId === 'missing-viewport'));
	assert.ok(serial.some(finding => finding.patternId === 'browser-dialog'));
	assert.ok(serial.some(finding => finding.patternId === 'unscoped-global-selector'));
	assert.ok(serial.some(finding => finding.patternId === 'extreme-z-index'));
	assert.ok(!serial.some(finding => finding.patternId === 'arbitrary-z-index'));
	assert.ok(!serial.some(finding => finding.file.includes('.awtsmoos-agent-thoughts')));
	assert.ok(!serial.some(finding => finding.snippet.includes('IGNORE_AGENT_MEMORY')));
} finally {
	await rm(root, { recursive: true, force: true });
}

console.log('B"H plain UI scanner verified.');

/** @param {string} rootDirectory Temporary audit root. */
async function createFixture(rootDirectory) {
	await mkdir(path.join(rootDirectory, 'app'), { recursive: true });
	await mkdir(path.join(rootDirectory, '.awtsmoos-agent-thoughts'), { recursive: true });
	await writeFile(
		path.join(rootDirectory, 'app', 'index.html'),
		'<html><head><link rel="stylesheet" href="style.css"></head><body><button>Go</button><script>alert("x")</script></body></html>'
	);
	await writeFile(
		path.join(rootDirectory, 'app', 'style.css'),
		'body { width: 900px; z-index: 500; } body.app { color: white; }'
	);
	await writeFile(
		path.join(rootDirectory, '.awtsmoos-agent-thoughts', 'memory.js'),
		'alert("IGNORE_AGENT_MEMORY")'
	);
}
