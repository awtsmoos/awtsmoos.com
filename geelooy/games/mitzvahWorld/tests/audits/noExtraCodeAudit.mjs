#!/usr/bin/env node
/**
 * B"H
 * Fails when legacy/prototype paths become ambiguous extra code.
 */
import fs from 'node:fs';
import { LEGACY_PATH_MANIFEST } from './legacyPathManifest.mjs';

const expected = new Set(LEGACY_PATH_MANIFEST.map(item => item.path));
const candidates = ['main.html', 'secretEditor.html', 'src/core', 'src/ui', 'src/levels', 'mainThread'];
const missing = [...expected].filter(path => !fs.existsSync(path));
const unclassified = candidates.filter(path => fs.existsSync(path) && !expected.has(path));
const activeFalse = LEGACY_PATH_MANIFEST.filter(item => item.active !== false);

if (missing.length || unclassified.length || activeFalse.length) {
  console.error(JSON.stringify({ ok: false, missing, unclassified, activeFalse }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, classified: LEGACY_PATH_MANIFEST }, null, 2));
