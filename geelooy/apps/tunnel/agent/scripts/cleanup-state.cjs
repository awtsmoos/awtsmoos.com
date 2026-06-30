#!/usr/bin/env node
// B"H
const path = require('path');
const { cleanupAwtsmoosState } = require('../lib/runtime/history-cleanup.js');
function arg(name, fallback = '') { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] || fallback : fallback; }
const projectRoot = arg('--project-root', process.cwd());
const installRoot = arg('--install-root', '');
const maxBytes = Number(arg('--max-bytes', process.env.AWTSMOOS_STATE_MAX_BYTES || 5 * 1024 * 1024 * 1024));
const dryRun = process.argv.includes('--dry-run');
const result = cleanupAwtsmoosState({ projectRoot:path.resolve(projectRoot), installRoot:installRoot ? path.resolve(installRoot) : '', maxBytes, dryRun });
console.log(JSON.stringify({ BH:'B"H', ok:true, action:'cleanup-state', projectRoot, installRoot, maxBytes, dryRun, result }, null, 2));
