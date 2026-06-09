// B"H
/**
 * Chapter 292: Render performance covenant.
 * The main Heichel render path should avoid string-clearing churn and gather
 * child nodes in fragments before attaching them to living vessels.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = [
    'geelooy/heichelos/heichel/modules/engine/scribe-of-manifestation.js',
    'geelooy/heichelos/heichel/modules/ui/render.js',
    'geelooy/heichelos/heichel/modules/ui/render/header.js',
    'geelooy/heichelos/heichel/modules/ui/render/controls.js'
];

const source = Object.fromEntries(files.map(file => [file, readFileSync(file, 'utf8')]));

for (const [file, text] of Object.entries(source)) {
    assert.doesNotMatch(text, /\.innerHTML\s*=\s*['"]{0,1}/, `${file} must not clear by innerHTML`);
}

assert.match(source[files[0]], /createDocumentFragment\(\)/, 'scribe must gather children in a fragment');
assert.match(source[files[0]], /speakChildren/, 'scribe must isolate child manifestation');
assert.match(source[files[1]], /target\.replaceChildren\(rootVessel\)/, 'world render must replace children directly');
assert.match(source[files[2]], /DOMElements\.breadcrumb\.replaceChildren\(fragment\)/, 'breadcrumb must swap a fragment');
assert.match(source[files[3]], /replaceChildren\(\)/, 'owner controls must clear with replaceChildren');

console.log('B"H renderPerformanceContract.test passed');
