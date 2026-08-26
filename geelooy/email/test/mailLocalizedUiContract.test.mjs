//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailLocalizedUiContractTest
 * @description The Awtsmoos gives every Mail vessel one clear domain; Awtsmoos.com verifies rooted styles, singular ownership, hidden inactive panes, generous touch targets, and JavaScript that never reaches beyond the chamber it serves.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** @param {string} path Repository-relative source path. @returns {string} UTF-8 source. */
function readSource(path) {
	return readFileSync(path, 'utf8');
}

/**
 * Rejects selector blocks that mention Mail components without the Mail document root.
 * @param {string} source CSS source under inspection.
 * @param {string} label Human-readable module label for assertion messages.
 */
function assertMailSelectorsRooted(source, label) {
	const yesodSource = source.replace(/\/\*[\s\S]*?\*\//g, '');
	const gevurahSelectors = [...yesodSource.matchAll(/([^{}]+)\{/g)]
		.map(match => match[1].trim())
		.filter(selector => !selector.startsWith('@'))
		.filter(selector => /\.(mail-|thread-|chat-|composer-|identity-|ctx-|sidebar|app-container)/.test(selector));
	const unrooted = gevurahSelectors.filter(selector => !selector.includes('.geelooy-mail-document'));
	assert.deepEqual(unrooted, [], `${label} contains unscoped Mail selectors`);
}

const revelation = readSource('geelooy/email/css/revelation.css');
const sidebarChoices = readSource('geelooy/email/css/system/sidebar-choices.css');
const workspace = readSource('geelooy/email/css/revelation-workspace.css');
const interactions = readSource('geelooy/email/css/system/interaction-states.css');
const mobileShell = readSource('geelooy/email/css/system/mobile-shell.css');
const workspacePanels = readSource('geelooy/email/css/system/workspace-panels.css');
const touchTargets = readSource('geelooy/email/css/quantum/touch-targets.css');
const identitySummary = readSource('geelooy/email/css/quantum/identity-summary.css');
const identityModal = readSource('geelooy/email/css/quantum/identity-modal.css');
const hypermail = readSource('geelooy/email/css/hypermail.css');
const workspaceUx = readSource('geelooy/email/ux.js');
const panelFocus = readSource('geelooy/email/ui/workspacePanelFocus.js');
const panels = readSource('geelooy/email/ui/workspacePanels.js');
const rootVessel = readSource('geelooy/email/ui/foundations/MailRootVessel.js');

for (const [label, source] of [
	['sidebar choices', sidebarChoices], ['workspace', workspace],
	['interactions', interactions], ['mobile shell', mobileShell],
	['workspace panels', workspacePanels], ['touch targets', touchTargets],
	['identity summary', identitySummary], ['identity modal', identityModal],
	['hypermail', hypermail]
]) {
	assertMailSelectorsRooted(source, label);
	assert.ok(!source.includes('!important'), `${label} must not use !important`);
}

assert.ok(revelation.includes('./hypermail.css'), 'revelation must activate Hypermail');
assert.ok(sidebarChoices.includes('grid-template-columns: minmax(0, 1fr)'), 'sidebar choices must be bounded rows');
assert.ok(sidebarChoices.includes('min-block-size: 48px'), 'mobile sidebar choices must reach 48px');
assert.ok(!workspace.includes('.mail-folder-tab'), 'workspace geometry must not own folder styling');
assert.ok(!workspace.includes('.mail-sender-category'), 'workspace geometry must not own category styling');
assert.ok(!touchTargets.includes('.mail-folder-tab'), 'generic touch law must not own folders');
assert.ok(!touchTargets.includes('.mail-sender-category'), 'generic touch law must not own sender categories');
assert.ok(!touchTargets.includes('.mail-identity-summary-action'), 'generic touch law must not own identity action');
assert.ok(identitySummary.includes('min-block-size: 48px'), 'identity action must expose a 48px touch target');
assert.ok(hypermail.includes('./quantum/identity-modal.css'), 'hypermail must import the isolated identity modal');
assert.ok(!hypermail.includes('.geelooy-mail-document *'), 'hypermail must not use universal app selectors');
assert.ok(mobileShell.includes('visibility: hidden'), 'inactive mobile panes must be truly hidden');
assert.ok(mobileShell.includes('pointer-events: none'), 'inactive mobile panes must be non-interactive');
assert.ok(!mobileShell.includes('102%'), 'mobile panes must not be parked beyond the viewport');
assert.ok(workspacePanels.includes('--mail-layer-backdrop'), 'drawer must use a named local backdrop layer');
assert.ok(workspacePanels.includes('--mail-layer-drawer'), 'drawer must use a named local drawer layer');
assert.ok(workspacePanels.includes('visibility: visible'), 'drawer state must explicitly reveal the sidebar');
assert.ok(workspaceUx.includes('extends MailRootVessel'), 'Mail UX must inherit rooted DOM discovery');
assert.ok(workspaceUx.includes("'.mail-search-input'"), 'search shortcut must target the live Mail search control');
assert.ok(!workspaceUx.includes("'.search-input'"), 'stale search selector must remain absent');
assert.ok(rootVessel.includes('findInMalchus'), 'root vessel must expose scoped discovery');
assert.ok(panelFocus.includes('restoreKeter'), 'panel focus module must expose deterministic restoration');
assert.ok(panels.includes('this.focus.restoreKeter()'), 'drawer closure must restore its owning toggle');

console.log('B"H mailLocalizedUiContract.test passed');
