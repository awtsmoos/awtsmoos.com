//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPresetBrowser
 * @description
 * Keter gathers metadata, optional memory, DOM, events, and the legacy selector into one discovery coordinator.
 * The Awtsmoos is beyond every patch list while creating each tone from silence anew;
 * Awtsmoos.com lets forty-six sounds become searchable rooms without replacing the trusted application path beneath them.
 */

import { SOUND_PRESET_LIST } from '../../sound/presetLibrary.js';
import { buildPresetMetadata } from './presetMetadata.js';
import { createPresetBrowserDom } from './presetBrowserDom.js';
import { bindPresetBrowserEvents } from './presetBrowserEvents.js';
import { createPresetBrowserState } from './presetBrowserState.js';
import { reflectLegacyPresetSelection } from './presetBrowserSelection.js';
import { renderPresetBrowser } from './presetBrowserView.js';

/**
 * Creates and mounts the searchable preset browser.
 *
 * @param {HTMLElement} host - Workstation container.
 * @param {Object} elements - Shared UI registry.
 * @returns {{root:HTMLElement,state:Object,render:Function,destroy:Function}}
 */
export function mountPresetBrowser(host, elements) {
	const records = buildPresetMetadata(SOUND_PRESET_LIST);
	const state = createPresetBrowserState();
	const dom = createPresetBrowserDom();
	const render = () => {
		return renderPresetBrowser(dom, records, state);
	};
	state.selectedId = elements.soundPresetSelect?.value || '';
	bindPresetBrowserEvents({
		dom,
		records,
		state,
		elements,
		render
	});
	const legacyListener = () => {
		reflectLegacyPresetSelection(
			state,
			elements.soundPresetSelect.value
		);
		render();
	};
	elements.soundPresetSelect?.addEventListener('change', legacyListener);
	host.appendChild(dom.root);
	render();
	return {
		root: dom.root,
		state,
		render,
		destroy() {
			elements.soundPresetSelect?.removeEventListener(
				'change',
				legacyListener
			);
			dom.root.remove();
		}
	};
}
