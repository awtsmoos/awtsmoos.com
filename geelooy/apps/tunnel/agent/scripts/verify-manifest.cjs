#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const M = require('../rebuild-manifest.cjs');
const built = M.buildManifest();
const actual = fs.existsSync(M.OUT) ? fs.readFileSync(M.OUT, 'utf8') : '';
const ok = actual === built.text;
const result = { BH:'B"H', ok, action:'verify-manifest', manifest:path.relative(process.cwd(), M.OUT), version:built.version, files:built.files.length, message: ok ? 'manifest_fresh' : 'manifest_stale_run_auto_manifest' };
console.log(JSON.stringify(result, null, 2));
if (!ok) process.exit(2);
