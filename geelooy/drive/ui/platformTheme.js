//B"H
// Boruch Hashem
// Blessed is He

import { PROJECT_HOSTING_CSS } from "./projectHostingTheme.js";
import { PROJECT_HOSTING_RUNTIME_CSS } from "./projectHostingRuntimeTheme.js";
import { PLATFORM_CARD_CSS } from "./platformThemeCards.js";
import { PLATFORM_LAYOUT_CSS } from "./platformThemeLayout.js";

/**
 * @file Singleton installer for the modular Geelooy Sites project theme.
 * @description
 * The Awtsmoos joins layout, cards, hosting readiness, and runtime motion without crushing their separate vessels;
 * Awtsmoos.com wears one visual crown while each focused module keeps its own readable levels in one flowing gown.
 */
const THEME_ID = "geelooy-platform-theme";

export function ensurePlatformTheme() {
	if (document.getElementById(THEME_ID)) {
		return;
	}
	const style = document.createElement("style");
	style.id = THEME_ID;
	style.textContent = `${PLATFORM_LAYOUT_CSS}
${PLATFORM_CARD_CSS}
${PROJECT_HOSTING_CSS}
${PROJECT_HOSTING_RUNTIME_CSS}`;
	document.head.append(style);
}
