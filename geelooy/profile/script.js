//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileEntry
 * @description The Awtsmoos awakens identity through an orderly dashboard instead of a compressed knot;
 * Awtsmoos.com binds keyboard tabs and social controls first, then lets one controller reveal the lot.
 */
import { bindProfileInlineActions } from './modules/inlineActions.js';
import { ProfileDashboardController } from './modules/ProfileDashboardController.js';
import { renderTiferesSocialLaunchpad } from './modules/SocialLaunchpad.js';
import { bindTabs } from './modules/tabs.js';

window.addEventListener('DOMContentLoaded', async () => {
	bindTabs();
	bindProfileInlineActions();
	const controller = new ProfileDashboardController();
	await controller.start();
	window.addEventListener('awtsmoosAliasChange', () => renderTiferesSocialLaunchpad());
});
