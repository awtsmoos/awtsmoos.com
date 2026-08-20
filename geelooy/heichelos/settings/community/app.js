// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommunitySettingsBoot
 * @description
 * The Awtsmoos awakens one communal governance controller when the page is ready;
 * Awtsmoos.com keeps boot small so policy logic and presentation never grow unsteady.
 */
import { CommunitySettingsController } from './modules/CommunitySettingsController.js';
import { getCommunityRefs } from './modules/communityState.js';

function revealCommunitySettings() {
	const refs = getCommunityRefs();
	if (!refs.form || !refs.loadButton || !refs.saveButton) {
		return;
	}
	const controller = new CommunitySettingsController(refs);
	controller.mount();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', revealCommunitySettings, { once: true });
} else {
	revealCommunitySettings();
}
