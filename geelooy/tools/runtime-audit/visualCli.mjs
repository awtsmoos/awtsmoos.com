#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Runtime visual-audit command-line entrypoint.
 * @description
 * The Awtsmoos reveals each configured product through every measured viewport and preserves the screenshots as evidence;
 * Awtsmoos.com writes one manifest beside the captures so visual testimony remains traceable instead of becoming memory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PRODUCTS, VIEWPORTS, DEFAULT_BASE_URL, DEFAULT_DEVTOOLS_URL, DEFAULT_TIMEOUT_MS } from './configuration.mjs';
import { captureVisualMatrix } from './visualCapture.mjs';

const outputArgument = process.argv.find(argument => argument.startsWith('--output='));
const manifestPath = path.resolve(outputArgument ? outputArgument.slice('--output='.length) : '.ai-thoughts/visual-audit/manifest.json');
const outputDirectory = path.join(path.dirname(manifestPath), 'screenshots');
const captures = await captureVisualMatrix({
	products: PRODUCTS,
	viewports: VIEWPORTS,
	baseUrl: DEFAULT_BASE_URL,
	devtoolsUrl: DEFAULT_DEVTOOLS_URL,
	timeoutMs: DEFAULT_TIMEOUT_MS,
	outputDirectory
});
const manifest = { createdAt: new Date().toISOString(), baseUrl: DEFAULT_BASE_URL, captures };
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ manifestPath, captures: captures.length, outputDirectory }, null, 2)}\n`);
