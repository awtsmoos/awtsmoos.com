// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelEditorShellContractTest
 * @description
 * The Awtsmoos verifies that Awtsmoos.com preserves the honest governance gate
 * while one shared ribbon names actor, palace, readiness, and ordinary anchors.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/heichel-editor';
const html = readFileSync(`${base}/index.html`, 'utf8');
const app = readFileSync(`${base}/app.js`, 'utf8');
const config = readFileSync(`${base}/modules/config.js`, 'utf8');
const render = readFileSync(`${base}/modules/render.js`, 'utf8');
const context = readFileSync(`${base}/modules/shellContext.js`, 'utf8');

assert.equal((html.match(/social\/shell\/boot\.js/g) || []).length, 1, 'Heichel editor needs one shell boot');
assert.ok(html.includes('geelooy-content-region'), 'Heichel editor needs the canonical content region');
assert.ok(html.includes('heichel-editor-title'), 'entry needs a truthful fallback heading');
assert.ok(app.includes('readEditorConfig') && app.includes('renderEditor'), 'existing route gate must stay connected');
assert.ok(app.includes('publishRouteContext') && app.includes('createHeichelEditorShellContext'), 'route must publish context');
assert.ok(config.includes("missing.push('heichel')"), 'Heichel context must be required');
assert.ok(config.includes("missing.push('alias')"), 'actor alias must be required');
assert.ok(render.includes("id: 'heichel-editor-title'"), 'rendered states must preserve heading ownership');
assert.ok(render.includes('config.missing.length'), 'missing context must win before forms');
assert.ok(context.includes("state: blocked ? 'blocked' : 'ready'"), 'ribbon must expose governance readiness');
for (const fabricated of ['coby', 'ikar']) {
	assert.equal(`${config}\n${render}\n${context}`.includes(fabricated), false, `must not fabricate ${fabricated}`);
}
for (const [name, source] of Object.entries({ app, config, render, context })) {
	assert.ok(source.split('\n').length <= 120, `${name} must remain small`);
}
console.log('B"H heichelEditorShellContract.test passed');
