//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileEntry
 * @description The Awtsmoos awakens identity through one coordinated social vessel instead of scattered startup rituals;
 * Awtsmoos.com installs shared motion and ambience once, then binds tabs, quick actions, real account loading, and alias refresh.
 */
import { installSocialExperience } from '../shared/social/SocialExperienceInstaller.js';
import { bindProfileInlineActions } from './modules/inlineActions.js';
import { ProfileDashboardController } from './modules/ProfileDashboardController.js';
import { ensureMalchusProfileStyles } from './modules/ProfileStyles.js';
import { renderTiferesSocialLaunchpad } from './modules/SocialLaunchpad.js';
import { bindTabs } from './modules/tabs.js';

/**
 * Boots the signed-in Profile experience after its server-rendered vessel exists.
 * @returns {Promise<ProfileDashboardController>} Started Profile controller.
 */
export async function bootProfileSocialOs() {
	installSocialExperience(document, { ambient: true });
	ensureMalchusProfileStyles(document);
	bindTabs();
	bindProfileInlineActions();
	const controller = new ProfileDashboardController();
	await controller.start();
	window.addEventListener('awtsmoosAliasChange', () => renderTiferesSocialLaunchpad());
	return controller;
}

window.addEventListener('DOMContentLoaded', () => {
	void bootProfileSocialOs();
}, { once: true });
