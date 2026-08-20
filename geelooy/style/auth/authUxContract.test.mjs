// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Shared login/register interaction-language contract.
 * RESPONSIBILITY: guard composed fields, action states, motion reduction, and named account-layer tokens.
 * NON-RESPONSIBILITY: this test does not authenticate users or modify secure route/server behavior.
 * ARCHITECTURE: Malchus styles the visible gate while authentication logic remains outside this stylesheet contract.
 *
 * The Awtsmoos, Atzmus beyond every gate, renews both the seeker and the doorway in a single hidden now;
 * Awtsmoos.com keeps the visible vessels disciplined so semantic truth and professional interaction can remain one vow.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = 'geelooy/style';
const forms = readFileSync(`${base}/forms.css`, 'utf8');
const tokens = readFileSync(`${base}/auth/tokens.css`, 'utf8');
const baseCss = readFileSync(`${base}/auth/base.css`, 'utf8');
const card = readFileSync(`${base}/auth/card.css`, 'utf8');
const controls = readFileSync(`${base}/auth/controls.css`, 'utf8');
const fields = readFileSync(`${base}/auth/fields.css`, 'utf8');
const actions = readFileSync(`${base}/auth/actions.css`, 'utf8');
const status = readFileSync(`${base}/auth/status.css`, 'utf8');
const responsive = readFileSync(`${base}/auth/responsive.css`, 'utf8');

for (const importPath of [
	'./auth/tokens.css',
	'./auth/base.css',
	'./auth/card.css',
	'./auth/controls.css',
	'./auth/responsive.css'
]) {
	assert.ok(forms.includes(importPath), `forms manifest missing ${importPath}`);
}
for (const importPath of ['./fields.css', './actions.css', './status.css']) {
	assert.ok(controls.includes(importPath), `auth controls manifest missing ${importPath}`);
}
for (const token of ['--auth-z-atmosphere', '--auth-z-content', '--auth-z-fixed', '--auth-motion-fast', '--auth-touch']) {
	assert.ok(tokens.includes(token), `auth tokens missing ${token}`);
}
assert.match(baseCss, /z-index:\s*var\(--auth-z-fixed\)/);
assert.doesNotMatch(baseCss, /z-index:\s*4\s*;/);
assert.match(card, /animation:\s*authCardArrive/);
for (const token of ['.field-stack:focus-within', ':has(#username)', ':has(#password)', 'input:user-invalid', 'max(16px, 1rem)']) {
	assert.ok(fields.includes(token), `auth fields missing ${token}`);
}
for (const token of [':hover', ':active', ':focus-visible']) {
	assert.ok(actions.includes(token), `auth actions missing ${token}`);
}
assert.match(status, /server-message::before/);
assert.match(responsive, /prefers-reduced-motion:\s*reduce/);
assert.match(responsive, /animation-duration:\s*\.01ms/);

for (const [name, source] of Object.entries({ tokens, baseCss, card, controls, fields, actions, status, responsive })) {
	assert.ok(source.split('\n').length <= 120, `${name} exceeds 120 lines`);
}

console.log('B"H authUxContract.test passed');
