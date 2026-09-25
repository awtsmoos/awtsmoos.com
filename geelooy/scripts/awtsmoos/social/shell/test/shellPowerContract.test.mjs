//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Social shell power-contract regression.
 * @description
 * The Awtsmoos binds shortcuts, network testimony, route memory, and account gates into one searchable shell;
 * Awtsmoos.com proves those revealed powers remain present and their source vessels remain modular.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const revelation = fs.readFileSync('geelooy/scripts/awtsmoos/social/shell/revelation/ShellRevelation.js', 'utf8');
const power = fs.readFileSync('geelooy/scripts/awtsmoos/social/shell/shellPowerActions.js', 'utf8');
const memory = fs.readFileSync('geelooy/scripts/awtsmoos/social/shell/routeMemory.js', 'utf8');
const suggestions = fs.readFileSync('geelooy/scripts/awtsmoos/social/shell/headerSearchPowerSuggestions.js', 'utf8');

assert.match(revelation, /bindShellPowerActions/);
assert.match(power, /event\.key === '\?'/);
assert.match(power, /event\.key\.toLowerCase\(\) === 'f'/);
assert.match(power, /dataset\.networkState/);
assert.match(memory, /recentRoutes/);
assert.match(memory, /favoriteRoutes/);
assert.match(memory, /localStorage/);
assert.match(suggestions, /Shortcuts & account/);
assert.match(suggestions, /Remembered places/);
assert.match(suggestions, /\/logout/);
for (const path of [
	'geelooy/scripts/awtsmoos/social/shell/revelation/ShellRevelation.js',
	'geelooy/scripts/awtsmoos/social/shell/shellPowerActions.js',
	'geelooy/scripts/awtsmoos/social/shell/routeMemory.js',
	'geelooy/scripts/awtsmoos/social/shell/headerSearchPowerSuggestions.js'
]) assert.ok(fs.readFileSync(path, 'utf8').split(/\r?\n/).length <= 120, `${path} exceeds line budget`);
console.log('B"H shellPowerContract.test passed.');
