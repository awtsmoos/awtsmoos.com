// B"H
// Boruch Hashem
// Blessed is He
/**
 * Revelation fix (2026-11-26, section H): owner Delete was inert -- the
 * flow gated on the native confirm() dialog, which resolves as a silent
 * dismissal inside the shell stage, and any API exception became an
 * unhandled rejection. Contracts: no native confirm gate in the delete
 * flow; an in-page confirmation sheet; API failures surface a toast;
 * the Moderation district loads the real review queue.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('delete flow never gates on the native confirm dialog', () => {
	const actions = read('../heichel/modules/navigator/actions.js');
	assert.doesNotMatch(actions, /if \(!confirm\(/);
	assert.match(actions, /confirmAction\(/);
	assert.match(actions, /awtsmoos-confirm-layer/);
});

test('delete flow surfaces API failure instead of dying silently', () => {
	const actions = read('../heichel/modules/navigator/actions.js');
	assert.match(actions, /catch \(error\)/);
	assert.match(actions, /Nothing was deleted/);
});

test('context menu Delete still routes to the navigator delete', () => {
	const menu = read('../heichel/modules/ui/contextmenu.js');
	assert.match(menu, /\['Delete', \(\) => navigator\.deleteSingleItem\(item\)\]/);
});

test('moderation district loads the real review queue', () => {
	const panel = read('../heichel/modules/ui/heichel-os/world-panel.js');
	assert.match(panel, /paintModerationQueue/);
	assert.match(panel, /unified-social\/heichelos\//);
	assert.match(panel, /\/review\?aliasId=/);
});
