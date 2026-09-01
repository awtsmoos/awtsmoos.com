//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanel
 * @description
 * Keter gathers presets, deep sound design, performance behavior, synchronization, and safety into one workstation coordinator.
 * The Awtsmoos is beyond patch and gesture while recreating sound from silence anew;
 * Awtsmoos.com lets this coordinator remain small by delegating browser, sound events, performance events, styles, and field projection to focused vessels.
 */

import { applyPresetToElements } from '../../sound/presetControls.js';
import { getSoundPreset } from '../../sound/presets.js';
import {
	bindPerformancePanelEvents,
	syncPerformanceStateFromControls
} from './performancePanelEvents.js';
import { mountPresetBrowser } from './presetBrowser.js';
import {
	createSynthPanelDom,
	mountSynthPanelDom
} from './synthPanelDom.js';
import { bindSynthPanelEvents } from './synthPanelEvents.js';
import { buildSynthControlSections } from './synthPanelSections.js';
import { ensureSynthPanelStyles } from './synthPanelStyles.js';
import { refreshSynthFieldOutputs } from './synthPanelView.js';

/**
 * Mounts the Pro Synth workstation into the existing settings shell before saved settings load.
 *
 * @param {Object} elements - Shared UI registry containing legacy and dynamic controls.
 * @param {Object} callbacks - Persistence and active-sound callbacks supplied by app startup.
 * @returns {Object|null} Mounted workstation controller, or null without a settings host.
 */
export function createProSynthPanel(elements, callbacks) {
	const settingsHost = document.querySelector('.settings-content');
	if (!settingsHost) {
		return null;
	}
	ensureSynthPanelStyles();
	const dom = createSynthPanelDom();
	mountSynthPanelDom(dom, settingsHost);
	const fieldViews = buildSynthControlSections(
		dom.controlsHost,
		elements
	);
	const currentPreset = getSoundPreset(
		elements.soundPresetSelect?.value
	);
	applyPresetToElements(elements, currentPreset);
	const browser = mountPresetBrowser(
		dom.presetHost,
		elements
	);
	const eventOptions = {
		dom,
		fieldViews,
		elements,
		...callbacks
	};
	bindSynthPanelEvents(eventOptions);
	bindPerformancePanelEvents(eventOptions);
	return createPanelController(
		dom,
		browser,
		fieldViews,
		elements
	);
}

function createPanelController(
	dom,
	browser,
	fieldViews,
	elements
) {
	return {
		dom,
		browser,
		fieldViews,
		sync() {
			browser.state.selectedId = elements.soundPresetSelect?.value || '';
			browser.render();
			syncPerformanceStateFromControls(fieldViews);
			refreshSynthFieldOutputs(fieldViews);
		}
	};
}
