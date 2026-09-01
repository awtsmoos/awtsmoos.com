//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelEvents
 * @description
 * Netzach carries sound-design gestures into the correct depth while leaving the separate Performance domain to its own covenant.
 * The Awtsmoos is beyond gesture and consequence while recreating both each instant;
 * Awtsmoos.com keeps LIVE voice refresh, NEXT NOTE persistence, legacy reflection, and shell visibility explicit without swallowing arp or velocity policy.
 */

import { mirrorProToLegacy } from '../../sound/presetControlAccess.js';
import {
	reflectLegacyField,
	refreshSynthFieldOutputs,
	setSynthPanelVisible,
	showSynthMutationStatus
} from './synthPanelView.js';

/**
 * Binds shell visibility and every sound-domain parameter control.
 *
 * @param {Object} options - Panel DOM, field views, elements and sound callbacks.
 * @returns {void}
 */
export function bindSynthPanelEvents(options) {
	const {
		dom,
		fieldViews,
		elements
	} = options;
	dom.launcher.setAttribute('aria-expanded', 'false');
	dom.launcher.addEventListener('click', () => {
		const visible = dom.panel.classList.contains('pro-synth-hidden');
		setSynthPanelVisible(dom, visible);
	});
	dom.close.addEventListener('click', () => {
		setSynthPanelVisible(dom, false);
	});
	for (const fieldView of soundFieldViews(fieldViews)) {
		bindProField(fieldView, options);
		bindLegacyReflection(fieldView, options);
	}
	elements.soundPresetSelect?.addEventListener('change', () => {
		queueMicrotask(() => {
			refreshSynthFieldOutputs(fieldViews);
		});
	});
}

function bindProField(fieldView, options) {
	const eventName = fieldView.field.type === 'range'
		? 'input'
		: 'change';
	fieldView.control.addEventListener(eventName, () => {
		mirrorProToLegacy(
			options.elements,
			fieldView.field
		);
		fieldView.output.textContent = formatFieldOutput(fieldView);
		showSynthMutationStatus(options.dom, fieldView.field);
		if (fieldView.field.mode === 'live') {
			options.refreshActiveSound(
				options.elements,
				options.saveSettings,
				fieldView.field.param
			);
			return;
		}
		options.saveSettings(options.elements);
	});
}

function bindLegacyReflection(fieldView, options) {
	const key = fieldView.field.legacyKey;
	const legacy = key ? options.elements[key] : null;
	if (!legacy) {
		return;
	}
	const reflect = () => {
		reflectLegacyField(options.elements, fieldView);
	};
	legacy.addEventListener('input', reflect);
	legacy.addEventListener('change', reflect);
}

function soundFieldViews(fieldViews) {
	return [...fieldViews.values()].filter((fieldView) => {
		return fieldView.field.domain !== 'performance';
	});
}

function formatFieldOutput(fieldView) {
	if (fieldView.field.type === 'select') {
		return fieldView.control.selectedOptions[0]?.textContent
			|| fieldView.control.value;
	}
	const value = Number(fieldView.control.value);
	const displayValue = Number.isFinite(value)
		? value
		: fieldView.control.value;
	return `${displayValue}${fieldView.field.unit || ''}`;
}
