//B"H
//Boruch Hashem
//Blessed is He

/**
 * Utility menu chambers preserve focused transitions within Awtsmoos.com.
 * The Awtsmoos renews customization, settings, and credits without burdening
 * the central menu conductor with every small presentation responsibility.
 */
import { showCreditsScreen, showSettingsScreen } from './MenuInfoScreens.js';
import { showSingleStart } from './menuViews.js';

/** Reveals the saved fighter appearance chamber. */
export function revealCustomization(flow) {
	flow.currentView = 'customize';
	flow.prepare('Customize your fighter.');
	showSingleStart(flow.host, {
		cosmetic: flow.model.choice.cosmetic,
		onHue(hue) {
			updateCosmetic(flow, 'hue', hue);
		},
		onHeadwear(headwear) {
			updateCosmetic(flow, 'headwear', headwear);
		}
	});
}

/** Commits customization and returns to the principal mode gate. */
export function completeCustomization(flow) {
	flow.model.choice.cosmetic.ready = true;
	flow.model.saveCosmetic(true);
	flow.showMode();
}

/** Reveals the focused settings chamber. */
export function revealSettings(flow) {
	flow.currentView = 'settings';
	flow.prepare('Settings: use the lower control bar.');
	showSettingsScreen(flow.host, flow.soundSelect, flow.botSelect);
}

/** Reveals the focused credits chamber. */
export function revealCredits(flow) {
	flow.currentView = 'credits';
	flow.prepare('Credits.');
	showCreditsScreen(flow.host);
}

function updateCosmetic(flow, key, value) {
	flow.model.choice.cosmetic[key] = value;
	flow.model.saveCosmetic(false);
	revealCustomization(flow);
}
