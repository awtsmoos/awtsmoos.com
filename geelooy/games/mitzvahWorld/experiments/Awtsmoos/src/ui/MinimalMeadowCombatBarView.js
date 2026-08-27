// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatBarView.js
 * @description Builds pictographic action slots, cooldowns, target control, status, and cast meter.
 * The Awtsmoos gives symbol, letter, key, and timing their proper visible vessels;
 * Awtsmoos.com makes each deed instantly recognizable while Hebrew remains spoken and accessible.
 */

import { minimalMeadowCombatActionList } from '../app/MinimalMeadowCombatActions.js';

export function createMinimalMeadowCombatBarView(host) {
	const documentValue = host.ownerDocument;
	const root = element(documentValue, 'section', 'Awtsmoos-combat-host');
	const meter = createCastMeter(documentValue);
	const bar = element(documentValue, 'div', 'Awtsmoos-combat-bar');
	const buttons = new Map();
	for (const action of minimalMeadowCombatActionList()) {
		const button = createActionButton(documentValue, action);
		buttons.set(action.id, button);
		bar.append(button);
	}
	const targetButton = element(documentValue, 'button');
	targetButton.type = 'button';
	targetButton.dataset.targetCycle = 'true';
	targetButton.setAttribute('aria-label', 'Cycle combat target');
	targetButton.innerHTML = '<b aria-hidden="true">🎯</b><small>Tab</small>';
	const collapseButton = element(documentValue, 'button');
	collapseButton.type = 'button';
	collapseButton.dataset.collapse = 'true';
	collapseButton.setAttribute('aria-label', 'Collapse combat actions');
	collapseButton.textContent = '−';
	const status = element(documentValue, 'output');
	status.textContent = 'Combat loading…';
	bar.append(targetButton, status, collapseButton);
	root.append(meter.root, bar);
	host.className = 'Awtsmoos-combat-host-container';
	host.replaceChildren(root);
	return { bar, buttons, collapseButton, meter, root, status, targetButton };
}

export function updateMinimalMeadowCastView(view, payload = null) {
	const visible = Boolean(payload);
	view.meter.root.dataset.visible = String(visible);
	if (!visible) {
		view.meter.fill.style.width = '0%';
		view.meter.time.textContent = '0.00s';
		return;
	}
	const progress = clampUnit(payload.progress);
	const remaining = finiteRemaining(payload, progress);
	view.meter.label.textContent = `${payload.label || 'Casting'} · ${payload.letters || ''}`;
	view.meter.fill.style.width = `${Math.round(progress * 100)}%`;
	view.meter.time.textContent = `${remaining.toFixed(2)}s`;
}

export function updateMinimalMeadowCooldownView(view, payload = {}) {
	for (const [actionId, button] of view.buttons) {
		const remaining = Math.max(0, Number(payload.actions?.[actionId]) || 0);
		button.disabled = remaining > 0.04;
		button.dataset.cooldown = String(remaining > 0.04);
		button.querySelector('[data-cooldown-value]').textContent = remaining > 0.04
			? remaining.toFixed(1)
			: '';
	}
}

function createActionButton(documentValue, action) {
	const button = element(documentValue, 'button');
	button.type = 'button';
	button.dataset.actionId = action.id;
	button.title = `${action.label} · ${action.letters} · ${action.castTime}s cast · ${action.cooldown}s cooldown`;
	button.setAttribute(
		'aria-label',
		`${action.label}, ${action.letters}, key ${action.keyLabel}`
	);
	button.innerHTML = [
		`<b aria-hidden="true">${action.icon}</b>`,
		`<span class="Awtsmoos-action-letters">${action.letters}</span>`,
		`<small>${action.keyLabel}</small>`,
		'<em data-cooldown-value></em>'
	].join('');
	return button;
}

function createCastMeter(documentValue) {
	const root = element(documentValue, 'section', 'Awtsmoos-cast-meter');
	root.dataset.visible = 'false';
	const header = element(documentValue, 'header');
	const label = element(documentValue, 'strong');
	const time = element(documentValue, 'small');
	header.append(label, time);
	const track = element(documentValue, 'div');
	const fill = element(documentValue, 'i');
	track.append(fill);
	root.append(header, track);
	return { fill, label, root, time };
}

function finiteRemaining(payload, progress) {
	const supplied = Number(payload.remaining);
	if (Number.isFinite(supplied)) return Math.max(0, supplied);
	const duration = Math.max(0, Number(payload.duration) || 0);
	return Math.max(0, duration * (1 - progress));
}

function clampUnit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}

function element(documentValue, tagName, className = '') {
	const node = documentValue.createElement(tagName);
	if (className) node.className = className;
	return node;
}
