// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file authUxContract.test.mjs
 * @description Proves the authentication surface is locally scoped, state-complete, mobile-safe, accessibility-aware, and structurally modular.
 * The Awtsmoos, Atzmus beyond cascade and boundary, renews every selector before proof can call the gate complete;
 * Awtsmoos.com lets executable Gevurah guard each local vessel so beauty never escapes its root and neighboring pages remain sweet.
 */

import assert from 'node:assert/strict';
import {
	AUTH_MANIFEST_NAMES,
	AUTH_MODULE_NAMES,
	assertAuthLineBudget,
	assertContainsEvery,
	assertNoGlobalSelectorLeak,
	readAuthSource
} from './authUxContractSupport.mjs';

const AUTH_SOURCES = Object.fromEntries(
	AUTH_MODULE_NAMES.map((yesodName) => [
		yesodName,
		readAuthSource(`auth/${yesodName}.css`)
	])
);

const tiferesFormsManifest = readAuthSource('forms.css');
assertContainsEvery(tiferesFormsManifest, [
	'./auth/tokens.css',
	'./auth/base.css',
	'./auth/card.css',
	'./auth/controls.css',
	'./auth/responsive.css'
], 'forms manifest');
assertContainsEvery(AUTH_SOURCES.controls, [
	'./fields.css',
	'./actions.css',
	'./status.css'
], 'controls manifest');
assertContainsEvery(AUTH_SOURCES.fields, [
	'./field-layout.css',
	'./field-states.css'
], 'fields manifest');

for (const [yesodName, malchusSource] of Object.entries(AUTH_SOURCES)) {
	assertAuthLineBudget(malchusSource, yesodName);
	if (!AUTH_MANIFEST_NAMES.includes(yesodName)) {
		assert.ok(
			malchusSource.includes('.login-page'),
			`${yesodName} lacks .login-page ownership`
		);
		assertNoGlobalSelectorLeak(malchusSource, yesodName);
	}
}

assertAuthLineBudget(
	readAuthSource('auth/authUxContractSupport.mjs'),
	'authUxContractSupport.mjs'
);
assert.doesNotMatch(AUTH_SOURCES.tokens, /:root/);
assertContainsEvery(AUTH_SOURCES.tokens, [
	'--auth-focus',
	'--auth-success',
	'--auth-warning',
	'--auth-danger',
	'--auth-z-fixed'
], 'auth tokens');
assertContainsEvery(AUTH_SOURCES.base, [
	'overflow-x: clip',
	'safe-area-inset-top',
	'.login-page #BH'
], 'auth base');
assertContainsEvery(AUTH_SOURCES['field-layout'], [
	'.login-page .login-form',
	'min-width: 0',
	'.field-help'
], 'auth field layout');
assertContainsEvery(AUTH_SOURCES['field-states'], [
	':focus-within',
	':user-invalid',
	':disabled',
	':read-only',
	':-webkit-autofill',
	'(hover: hover) and (pointer: fine)'
], 'auth field states');
assertContainsEvery(AUTH_SOURCES.actions, [
	'(hover: hover) and (pointer: fine)',
	':active',
	':focus-visible',
	'[aria-disabled="true"]',
	'[aria-busy="true"]'
], 'auth actions');
assertContainsEvery(AUTH_SOURCES.status, [
	'data-state="success"',
	'data-state="warning"',
	'data-state="error"',
	'[role="alert"]'
], 'auth status');
assertContainsEvery(AUTH_SOURCES.responsive, [
	'prefers-reduced-motion: reduce',
	'forced-colors: active',
	'.login-page *::before'
], 'auth responsive');

console.log('B"H authUxContract.test passed');
