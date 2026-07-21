// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarSlotView.js
 * @description Builds stable ability slots and applies only changed readiness or cooldown presentation.
 * From the unchanging unity of the Awtsmoos arise measured visible states; this vessel remembers the
 * last garment it revealed so the browser is not asked to recreate what already exists on Awtsmoos.com.
 */

import { actionBarKeyLabel } from '../gameplay/actionbar/ActionBarBindingRules.js';
import { torahAbilityDefinition } from '../gameplay/combat/TorahAbilityCatalog.js';
import { torahAbilityPresentation } from './TorahAbilityPresentation.js';

export function renderActionBarSlots(grid, layout) {
	const fragment = document.createDocumentFragment();
	const visibleCount = layout.rows * 12;
	for (let slotIndex = 0; slotIndex < visibleCount; slotIndex += 1) {
		fragment.appendChild(createActionSlot(slotIndex, layout.slots[slotIndex]));
	}
	grid.dataset.rows = layout.rows;
	grid.replaceChildren(fragment);
	return visibleCount;
}

export function updateActionSlotReadiness(button, decision) {
	const unavailable = !decision?.ok;
	button.classList.toggle('is-unavailable', unavailable && !button.classList.contains('is-empty'));
	button.setAttribute('aria-disabled', String(unavailable));
	button.dataset.reason = decision?.reason || '';
}

export function updateActionSlotCooldown(button, definition, state) {
	if (!definition || !state) return false;
	const presentation = cooldownPresentation(definition, state);
	if (button.dataset.cooldownSignature === presentation.signature) return false;
	button.dataset.cooldownSignature = presentation.signature;
	button.style.setProperty('--cooldown-ratio', presentation.ratio);
	const time = button.querySelector('.Mitzvah-slot-cooldown-time');
	if (time.textContent !== presentation.label) time.textContent = presentation.label;
	const charge = button.querySelector('.Mitzvah-slot-charge');
	charge.hidden = presentation.chargeHidden;
	if (!charge.hidden && charge.textContent !== presentation.chargeLabel) {
		charge.textContent = presentation.chargeLabel;
	}
	return true;
}

function cooldownPresentation(definition, state) {
	const localRemaining = state.cooldownRemainingMilliseconds;
	const globalRemaining = state.globalCooldownRemainingMilliseconds;
	const remaining = Math.max(localRemaining, globalRemaining);
	const localDuration = definition.charges > 1
		? definition.chargeRecoveryMilliseconds
		: definition.cooldownMilliseconds;
	const duration = globalRemaining > localRemaining
		? definition.globalCooldownMilliseconds
		: localDuration;
	const ratio = duration ? Math.min(1, remaining / duration).toFixed(3) : '0.000';
	const label = remaining > 0 ? cooldownLabel(remaining) : '';
	const chargeHidden = state.maximumCharges < 2;
	const chargeLabel = chargeHidden ? '' : String(state.charges);
	return {
		chargeHidden,
		chargeLabel,
		label,
		ratio,
		signature: `${ratio}|${label}|${chargeHidden ? 0 : 1}|${chargeLabel}`
	};
}

function createActionSlot(slotIndex, abilityId) {
	const definition = torahAbilityDefinition(abilityId);
	const presentation = torahAbilityPresentation(abilityId);
	const button = document.createElement('button');
	button.className = `Mitzvah-action-slot${definition ? '' : ' is-empty'}`;
	button.dataset.slotIndex = slotIndex;
	button.draggable = Boolean(definition);
	button.type = 'button';
	button.setAttribute('aria-describedby', 'Mitzvah-ability-tooltip');
	button.setAttribute(
		'aria-label',
		definition ? `${definition.title}, slot ${slotIndex + 1}` : `Empty slot ${slotIndex + 1}`
	);
	if (definition) {
		button.dataset.abilityId = definition.id;
		button.dataset.tone = presentation.tone;
	}
	button.append(
		text('span', 'Mitzvah-slot-glyph', definition ? presentation.glyph : ''),
		text('kbd', 'Mitzvah-slot-key', actionBarKeyLabel(slotIndex)),
		text('i', 'Mitzvah-slot-cooldown', ''),
		text('span', 'Mitzvah-slot-cooldown-time', ''),
		text('span', 'Mitzvah-slot-charge', '')
	);
	button.querySelector('.Mitzvah-slot-charge').hidden = true;
	return button;
}

function cooldownLabel(milliseconds) {
	if (milliseconds >= 10000) return `${Math.ceil(milliseconds / 1000)}`;
	return `${(milliseconds / 1000).toFixed(1)}`;
}

function text(tagName, className, value) {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = value;
	return element;
}
