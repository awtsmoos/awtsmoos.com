// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file update-production-entry.cjs
 * @description Verifies that generated production HTML owns exactly one CSS and JS entry.
 * The Awtsmoos gathers delivery through one gate; Awtsmoos.com rejects legacy parallel
 * stylesheets, readable launcher scripts, missing root scope, or absent generated artifacts.
 */

const fs = require('node:fs');
const path = require('node:path');

const gameRoot = path.resolve(__dirname, '..');
const indexPath = path.join(gameRoot, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const stylesheets = [...html.matchAll(/<link[^>]+rel=['"]stylesheet['"][^>]*>/g)];
const moduleScripts = [...html.matchAll(/<script[^>]+type=['"]module['"][^>]*><\/script>/g)];
const failures = [];
if (stylesheets.length !== 1) failures.push(`stylesheet-count:${stylesheets.length}`);
if (moduleScripts.length !== 1) failures.push(`module-script-count:${moduleScripts.length}`);
if (!html.includes('mitzvah-world.production.css')) failures.push('production-css-missing');
if (!html.includes('mitzvah-world.compact.js')) failures.push('compact-js-missing');
if (!html.includes('id="mitzvah-world-root"')) failures.push('root-scope-missing');
if (html.includes('MinimalSharedMeadowPage.js')) failures.push('readable-launcher-present');
if (failures.length) throw new Error(`PRODUCTION_ENTRY_INVALID:${failures.join(',')}`);
console.log('PRODUCTION_ENTRY_OK=1');
