#!/usr/bin/env node
// B"H
const fs = require('fs');
const path = require('path');
const M = require('../rebuild-manifest.cjs');
const before = fs.existsSync(M.OUT) ? fs.readFileSync(M.OUT, 'utf8') : '';
const built = M.buildManifest({ forceBump:process.argv.includes('--force-bump') });
const changed = before !== built.text;
if (changed) fs.writeFileSync(M.OUT, built.text, 'utf8');
console.log(JSON.stringify({ BH:'B"H', ok:true, action:'auto-manifest', changed, manifest:path.relative(process.cwd(), M.OUT), version:built.version, files:built.files.length }, null, 2));
