//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPerformancePanelEvents
 * @description
 * Netzach turns workstation gesture controls into bounded performance state while the Awtsmoos remains beyond mode, sustain, tempo, and pattern.
 * Awtsmoos.com keeps these events outside sound-preset mutation,
 * so changing Arp or Velocity never rewrites a named timbre and Panic can still close every performance vessel in one clear motion.
 */

import { panicArpeggiator } from '../../performance/arpeggiator.js';
import { panicPerformance } from '../../performance/performancePanic.js';
import {
	performanceState,
	setPerformanceParameter
} from '../../performance/performanceState.js';
import { setLatchedSustain } from '../../performance/performanceSustain.js';
import { updateSynthFieldOutput } from './synthControlField.js';

/**
 * Binds all performance-domain fields and the workstation Panic button.
 *
 * @param {Object} options - Panel DOM, field views, shared elements and persistence callback.
 * @returns {void}
 */
export function bindPerformancePanelEvents(options) {
	for (const fieldView of performanceFieldViews(options.fieldViews)) {
		const eventName = fieldView.field.type === 'range'
			? 'input'
			: 'change';
		fieldView.control.addEventListener(eventName, () => {
			applyPerformanceField(fieldView, options);
		});
	}
	options.dom.panic.addEventListener('click', () => {
		panicPerformance();
		setControlValue(options.fieldViews, 'sustainLatch', 'off');
		setControlValue(options.fieldViews, 'arpEnabled', 'off');
		options.saveSettings(options.elements);
		options.dom.status.textContent = 'Panic: all notes, sustain memory, mono ownership, and arp timers cleared.';
	});
}

/**
 * Rebuilds runtime performance state from controls after saved settings load.
 *
 * @param {Map<string,Object>} fieldViews - Full workstation field registry.
 * @returns {void}
 */
export function syncPerformanceStateFromControls(fieldViews) {
	for (const fieldView of performanceFieldViews(fieldViews)) {
		storePerformanceField(fieldView);
		updateSynthFieldOutput(fieldView);
	}
	setLatchedSustain(performanceState.sustainLatch);
	if (!performanceState.arpEnabled) {
		panicArpeggiator();
	}
}

function applyPerformanceField(fieldView, options) {
	const parameter = fieldView.field.param;
	const previousMode = performanceState.voiceMode;
	storePerformanceField(fieldView);
	updateSynthFieldOutput(fieldView);
	if (parameter === 'sustainLatch') {
		setLatchedSustain(performanceState.sustainLatch);
	}
	if (parameter === 'arpEnabled' && !performanceState.arpEnabled) {
		panicArpeggiator();
	}
	if (parameter === 'voiceMode' && previousMode !== performanceState.voiceMode) {
		panicPerformance({
			clearSustain: false
		});
		setLatchedSustain(performanceState.sustainLatch);
	}
	options.saveSettings(options.elements);
	options.dom.status.textContent = `${fieldView.field.label}: performance setting saved.`;
}

function storePerformanceField(fieldView) {
	const parameter = fieldView.field.param;
	const rawValue = fieldView.control.value;
	const value = booleanParameter(parameter)
		? rawValue === 'on'
		: numericOrText(fieldView, rawValue);
	setPerformanceParameter(parameter, value);
}

function performanceFieldViews(fieldViews) {
	return [...fieldViews.values()].filter((fieldView) => {
		return fieldView.field.domain === 'performance';
	});
}

function numericOrText(fieldView, value) {
	return fieldView.field.type === 'range'
		? Number(value)
		: value;
}

function booleanParameter(parameter) {
	return parameter === 'sustainLatch'
		|| parameter === 'arpEnabled';
}

function setControlValue(fieldViews, parameter, value) {
	const fieldView = fieldViews.get(parameter);
	if (!fieldView) {
		return;
	}
	fieldView.control.value = value;
	storePerformanceField(fieldView);
	updateSynthFieldOutput(fieldView);
}
