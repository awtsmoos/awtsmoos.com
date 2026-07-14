// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MailCanonicalIdentityContractTest
 * @description
 * Guards Mail's one-profile covenant and generous touch geometry. The Awtsmoos
 * keeps identity visible in every chamber while Awtsmoos.com exposes only one
 * interactive dropdown, one backdrop, and one focus universe.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sidebar = source('../../geelooy/email/ui/sidebar.js');
const sidebarControls = source('../../geelooy/email/ui/sidebarControls.js');
const modals = source('../../geelooy/email/ui/modals.js');
const identity = source('../../geelooy/email/ui/identitySummary.js');
const contextMenu = source('../../geelooy/email/ui/contextMenu.js');
const hypermail = source('../../geelooy/email/css/hypermail.css');
const touch = source('../../geelooy/email/css/quantum/touch-targets.css');
const identityStyles = source('../../geelooy/email/css/quantum/identity-summary.css');

for (const content of [sidebar, sidebarControls, modals]) {
	assert.doesNotMatch(content, /createProfileDropdown/);
}
assert.match(sidebarControls, /mountMailIdentitySummary/);
assert.match(modals, /mountMailIdentitySummary/);
assert.match(identity, /awtsmoosAliasChange/);
assert.match(identity, /dataset\.awtsmoosLiveAlias/);
assert.match(identity, /\/login\?returnTo=%2Femail/);
assert.match(contextMenu, /role', 'menu'/);
assert.match(contextMenu, /ArrowDown/);
assert.match(hypermail, /identity-summary\.css\?v=mail-magic-001/);
assert.match(hypermail, /touch-targets\.css\?v=mail-magic-001/);
assert.match(touch, /min-height:\s*2\.75rem/);
assert.match(touch, /\.win-ctrl/);
assert.match(identityStyles, /data-mail-identity-summary/);

for (const relativePath of [
	'../../geelooy/email/ui/sidebar.js',
	'../../geelooy/email/ui/sidebarControls.js',
	'../../geelooy/email/ui/sidebarChoices.js',
	'../../geelooy/email/ui/modals.js',
	'../../geelooy/email/ui/composeModal.js',
	'../../geelooy/email/ui/identitySummary.js',
	'../../geelooy/email/ui/contextMenu.js',
	'../../geelooy/email/css/hypermail.css',
	'../../geelooy/email/css/quantum/touch-targets.css',
	'../../geelooy/email/css/quantum/identity-summary.css'
]) {
	const content = source(relativePath);
	assert.match(content.split('\n')[0], /B"H/);
	assert.ok(content.split('\n').length - 1 <= 120, `${relativePath} exceeds 120 lines`);
}
console.log('B"H Mail canonical identity contract passed.');

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}
