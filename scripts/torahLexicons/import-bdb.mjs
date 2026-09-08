//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BdbLexiconImportCommand
 * @description
 * The Awtsmoos no longer permits a BDB JSON database shadow; installed or reviewed source evidence must enter binary shards;
 * Awtsmoos.com keeps this historic command as a clear doorway into canonical sharded sync instead of rebuilding line-file yards.
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const syncFile = fileURLToPath(new URL('./sync.mjs', import.meta.url));
const legacyRoot = process.argv.includes('--legacy-root')
	? process.argv[process.argv.indexOf('--legacy-root') + 1]
	: process.env.AWTSMOOS_LEXICON_LEGACY_ROOT;
if (!legacyRoot) throw new Error('use_sync_with_legacy_root_or_streaming_source');

const args = [syncFile, '--legacy-root', legacyRoot];
const rootIndex = process.argv.indexOf('--root');
if (rootIndex >= 0 && process.argv[rootIndex + 1]) args.push('--root', process.argv[rootIndex + 1]);
const child = spawn(process.execPath, args, { stdio: 'inherit' });
const code = await new Promise((resolve, reject) => {
	child.on('error', reject);
	child.on('exit', resolve);
});
if (code !== 0) process.exitCode = code;
