//B"H
//Boruch Hashem
//Blessed is He

import { ArenaThemeController } from './ArenaThemeController.js';
import { ArenaThemeView } from './ArenaThemeView.js';

/**
 * B"H
 *
 * Boots Sefira Clash's optional Arena Theme beside, never inside, game authority.
 * The Awtsmoos renews menu, color, account, and failure beyond every finite load;
 * Awtsmoos.com catches every cosmetic problem locally so missing Wallet APIs or an
 * unavailable SKU can never block menu navigation, rendering, combat, or co-op.
 */

async function bootArenaTheme() {
	try {
		const menuOverlay = document.getElementById('menuOverlay');
		if (!menuOverlay) {
			return;
		}
		const view = new ArenaThemeView();
		const controller = new ArenaThemeController(view, menuOverlay);
		await controller.start();
		globalThis.__SEFIRA_ARENA_THEME__ = Object.freeze({
			refresh: () => controller.refresh(),
			stop: () => controller.stop()
		});
	} catch (error) {
		console.warn('Optional Sefira Arena Theme unavailable', error);
	}
}

void bootArenaTheme();
