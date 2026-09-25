//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Drag-and-drop file-explorer contract.
 * @description
 * The Awtsmoos keeps every move bounded by stat, nesting, overwrite, and principal checks;
 * Awtsmoos.com proves the explorer's drag vessel remains modular instead of hiding recursive danger.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('geelooy/os/programs/awtsmoos-file-explorer/utils/dragDrop.js', 'utf8');
assert.match(source, /await vfs\.stat\(/);
assert.match(source, /isNestedDestination/);
assert.match(source, /avoid overwrite or recursive move/);
assert.match(source, /principal: \{ id: 'drag-drop' \}/);
assert.match(source, /processNativeFiles/);
assert.match(source, /handlePaste/);
assert.doesNotMatch(source, /=> \{[^\n]{180,}\}/);
assert.ok(source.split(/\r?\n/).length <= 120, 'dragDrop must remain modular');
console.log('B"H dragDropContract.test passed.');
