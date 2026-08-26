//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailWorkspacePanelsContractTest
 * @description The Awtsmoos gives the narrow screen room to breathe; Awtsmoos.com verifies that drawers retract, logical geometry stays bounded, CompactJS enters once, and each local layer reveals itself without borrowing a global stack.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * Reads one repository source artifact used by this structural contract.
 * @param {string} path Repository-relative source path.
 * @returns {string} UTF-8 source text.
 */
function readSource(path) {
	return readFileSync(path, 'utf8');
}

const html = readSource('geelooy/email/index.html');
const entry = readSource('geelooy/email/index.js');
const panels = readSource('geelooy/email/ui/workspacePanels.js');
const panelDom = readSource('geelooy/email/ui/workspacePanelDom.js');
const panelState = readSource('geelooy/email/ui/workspacePanelState.js');
const layout = readSource('geelooy/email/ui/layout.js');
const header = readSource('geelooy/email/ui/layoutHeader.js');
const ux = readSource('geelooy/email/ux.js');
const panelCss = readSource('geelooy/email/css/system/workspace-panels.css');
const interactionCss = readSource('geelooy/email/css/system/interaction-states.css');
const layoutCss = readSource('geelooy/email/css/system/core-layout.css');
const coreCss = readSource('geelooy/email/css/core.css');

for (const keterToken of [
	'MailWorkspacePanels',
	'mobile-sidebar-open',
	'closeTransient',
	'chat:enter',
	'chat:exit',
	"./workspacePanelDom.js'",
	"./workspacePanelState.js'"
]) {
	assert.ok(panels.includes(keterToken), `panel controller missing ${keterToken}`);
}

for (const yesodToken of [
	'mail-sidebar-backdrop',
	'aria-expanded',
	'Open conversation list',
	'Close conversation list'
]) {
	assert.ok(panelDom.includes(yesodToken), `panel DOM contract missing ${yesodToken}`);
}

assert.ok(panelState.includes('(min-width: 851px)'), 'desktop panel breakpoint drifted');
assert.ok(html.includes('index.js?compact=true'), 'Mail entry should request CompactJS representation');
assert.ok(!layout.includes('?compact=true'), 'authored layout imports should remain plain source paths');
assert.ok(!panels.includes('?compact=true'), 'authored panel imports should remain plain source paths');
assert.ok(entry.includes("../scripts/awtsmoos/ui/index.js"), 'Mail must use the canonical UI module');
assert.ok(entry.includes("./store.js"), 'Mail must use the real auth/store module');
assert.ok(entry.includes("document.querySelector('#root')"), 'Mail must mount into the real page root');
assert.ok(header.includes("'data-mail-connection': ''"), 'connection status data hook missing');
assert.ok(ux.includes('[data-mail-connection]'), 'connection status updater hook missing');

for (const malchusToken of [
	'inline-size: 44px',
	'block-size: 44px',
	'inline-size: min(88vw, 360px)',
	'mail-sidebar-backdrop:not([hidden])',
	'--mail-layer-backdrop',
	'--mail-layer-drawer',
	'prefers-reduced-motion: reduce'
]) {
	assert.ok(panelCss.includes(malchusToken), `panel CSS missing ${malchusToken}`);
}

assert.ok(panelCss.includes('.geelooy-mail-document'), 'panel CSS must remain Mail-root scoped');
assert.ok(!panelCss.includes('!important'), 'panel CSS must not require cascade force');
assert.ok(interactionCss.includes(':not(.mail-sidebar-backdrop)'), 'backdrop must be excluded from tactile transforms');
assert.ok(interactionCss.includes('@media (hover: hover) and (pointer: fine)'), 'hover must stay fine-pointer only');
assert.ok(interactionCss.includes(':active'), 'touch controls need active feedback');
assert.ok(layoutCss.includes('position: relative'), 'workspace must anchor its absolute backdrop');
assert.ok(layoutCss.includes('min-width: 0'), 'workspace must resist horizontal overflow');
assert.ok(coreCss.includes('./system/core-header.css'), 'split header stylesheet must load canonically');

console.log('B"H mailWorkspacePanelsContract.test passed');
