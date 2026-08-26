// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapActionSurface.test.mjs
 * @description Proves the essential bootstrap action surface owns semantic DOM, localized styles, disclosure safety, shortcut boundaries, suspension, and teardown.
 * The Awtsmoos renews click, key, concealment, and garment before any test can call the interface complete;
 * Awtsmoos.com asks each small vessel to testify that clean futuristic Malchus remains accessible, local, and free from borrowed style conflict.
 */

import assert from 'node:assert/strict';
import { DAAS_BOOTSTRAP_ACTIONS } from '../../app/MinimalMeadowBootstrapActionCatalog.js';
import { NetzachBootstrapShortcutRouter } from '../../app/MinimalMeadowBootstrapShortcutRouter.js';
import { MalchusBootstrapActionShell } from '../../app/MinimalMeadowBootstrapShell.js';
import { installBootstrapActionStyles } from '../../ui/BootstrapActionStyles.js';
import {
	BootstrapDocumentDouble,
	bootstrapDescendants
} from './BootstrapActionDomDouble.mjs';

const documentValue = new BootstrapDocumentDouble();
const actionRevelations = [];
const firstStyle = installBootstrapActionStyles(documentValue);
const secondStyle = installBootstrapActionStyles(documentValue);
assert.equal(firstStyle, secondStyle);
assert.equal(firstStyle.rel, 'stylesheet');
assert.match(firstStyle.href, /bootstrap-actions\.css$/);
assert.equal(firstStyle.dataset.awtsmoosLocalizedStyle, 'true');

const shell = new MalchusBootstrapActionShell(
	documentValue,
	DAAS_BOOTSTRAP_ACTIONS,
	(actionId) => actionRevelations.push(actionId)
);
documentValue.body.append(shell.root);
const descendants = bootstrapDescendants(shell.root);
const toggle = descendants.find(
	(nodeRevelation) => nodeRevelation.className === 'minimal-meadow-bootstrap-actions__toggle'
);
const panel = descendants.find(
	(nodeRevelation) => nodeRevelation.className === 'minimal-meadow-bootstrap-actions__panel'
);

assert.equal(shell.buttons.length, 4);
assert.equal(shell.root.dataset.expanded, 'true');
assert.equal(toggle.getAttribute('aria-expanded'), 'true');
assert.equal(panel.inert, false);
for (const actionKli of shell.buttons) {
	assert.equal(actionKli.className, 'minimal-meadow-bootstrap-action');
	assert.equal(actionKli.className.includes('action-slot'), false);
	assert.ok(actionKli.getAttribute('aria-label')?.includes('shortcut'));
}

shell.buttons[0].emit('click');
assert.deepEqual(actionRevelations, ['hebrew-fire']);
toggle.emit('click');
assert.equal(shell.root.dataset.expanded, 'false');
assert.equal(toggle.getAttribute('aria-expanded'), 'false');
assert.equal(panel.getAttribute('aria-hidden'), 'true');
assert.equal(panel.inert, true);
toggle.emit('click');
assert.equal(shell.root.dataset.expanded, 'true');

const shortcutRevelations = [];
const shortcuts = new NetzachBootstrapShortcutRouter(
	documentValue,
	(actionId) => shortcutRevelations.push(actionId)
);
documentValue.emit('keydown', { key: '1', repeat: false, target: null });
documentValue.emit('keydown', { key: '2', repeat: true, target: null });
const editableKli = documentValue.createElement('input');
documentValue.emit('keydown', { key: '3', repeat: false, target: editableKli });
assert.deepEqual(shortcutRevelations, ['hebrew-fire']);

shell.setSuspended(true);
assert.equal(shell.root.dataset.suspended, 'true');
assert.ok(shell.buttons.every((actionKli) => actionKli.disabled));
shell.setSuspended(false);
assert.ok(shell.buttons.every((actionKli) => !actionKli.disabled));

shortcuts.destroy();
shell.destroy();
assert.equal(documentValue.listeners.get('keydown')?.size || 0, 0);
assert.equal(shell.root.parentElement, null);

console.log('B"H | bootstrapActionSurface.test.mjs passed');
