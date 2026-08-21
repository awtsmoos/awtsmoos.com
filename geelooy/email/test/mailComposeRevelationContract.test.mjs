// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Quantum Mail compose revelation contract.
 * RESPONSIBILITY: guard compose module boundaries, semantic field IDs, vector assets, interaction states, and reduced-motion support.
 * NON-RESPONSIBILITY: browser execution and network delivery are verified by runtime smoke, not inferred from this source contract.
 *
 * The Awtsmoos renews every field, action, and browser instant beyond the reach of a finite test;
 * Awtsmoos.com keeps static promises explicit so runtime proof can begin from a trustworthy nest.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = 'geelooy/email';
const modalFields = readFileSync(`${root}/ui/modalFields.js`, 'utf8');
const lifecycle = readFileSync(`${root}/ui/modalLifecycle.js`, 'utf8');
const view = readFileSync(`${root}/ui/composeModalView.js`, 'utf8');
const header = readFileSync(`${root}/ui/composeModalHeader.js`, 'utf8');
const actions = readFileSync(`${root}/ui/composeModalActions.js`, 'utf8');
const fieldsCss = readFileSync(`${root}/css/system/composer-fields.css`, 'utf8');
const iconsCss = readFileSync(`${root}/css/system/composer-field-icons.css`, 'utf8');
const actionsCss = readFileSync(`${root}/css/system/composer-actions.css`, 'utf8');
const motionCss = readFileSync(`${root}/css/system/composer-motion.css`, 'utf8');
const mobileCss = readFileSync(`${root}/css/system/composer-overlay-mobile.css`, 'utf8');
const manifest = readFileSync(`${root}/css/composer.css`, 'utf8');

for (const token of ['newTo', 'newSub', 'newBody', 'mail-field-heading', 'mail-field-vector', 'mail-field-hint']) {
	assert.ok(modalFields.includes(token), `compose field contract missing ${token}`);
}

for (const token of ['openModal', 'closeModal', 'bindModalEscape', "event.key === 'Escape'"]) {
	assert.ok(lifecycle.includes(token), `modal lifecycle missing ${token}`);
}

for (const token of ['composeHeader', 'composeActions', "field('To'", "field('Subject'", "'newBody'"]) {
	assert.ok(view.includes(token), `compose view missing ${token}`);
}

for (const token of ['mail-compose-title', 'compose-orbit-mark', 'Close compose', 'compose-vector-close']) {
	assert.ok(header.includes(token), `compose header missing ${token}`);
}

for (const token of ['composeTransmit', 'compose-action-cancel', 'compose-action-send', 'Send message']) {
	assert.ok(actions.includes(token), `compose actions missing ${token}`);
}

for (const token of ['mail-field-heading', ':focus-within', 'prefers-reduced-motion']) {
	assert.ok(fieldsCss.includes(token), `compose field CSS missing ${token}`);
}

for (const token of ['recipient.svg', 'subject.svg', 'message.svg', 'mask-image']) {
	assert.ok(iconsCss.includes(token), `compose icon CSS missing ${token}`);
}

for (const token of ['close.svg', 'cancel.svg', 'send.svg', 'sending.svg', ':disabled', 'mail-compose-spin']) {
	assert.ok(actionsCss.includes(token), `compose action CSS missing ${token}`);
}

for (const token of ['mail-compose-arrive', 'mail-compose-mark', 'prefers-reduced-motion']) {
	assert.ok(motionCss.includes(token), `compose motion CSS missing ${token}`);
}

for (const token of ['position: sticky', 'safe-area-inset-bottom', '100dvh']) {
	assert.ok(mobileCss.includes(token), `compose mobile CSS missing ${token}`);
}

assert.ok(manifest.includes('composer-field-icons.css?v=mail-revelation-005'), 'compose manifest must load current vector field CSS');
assert.ok(manifest.includes('composer-modals.css?v=mail-revelation-005'), 'compose manifest must load current modal bundle');

for (const icon of ['recipient', 'subject', 'message', 'close', 'cancel', 'send', 'sending']) {
	assert.ok(existsSync(`${root}/assets/icons/compose/${icon}.svg`), `compose SVG missing ${icon}`);
}

console.log('B"H mailComposeRevelationContract.test passed');
