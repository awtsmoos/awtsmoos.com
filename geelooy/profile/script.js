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
 * Shows a visible boot failure instead of leaving the page stuck on "Loading…".
 * The inline watchdog in index.html watches window.__profileBootState; 'failed'
 * tells it the module ran but could not start, so it must not overwrite this message.
 */
function showBootFailure(message) {
	try {
		const status = document.querySelector('[data-profile-status]');
		if (status) {
			status.textContent = message;
			status.dataset.profileStatus = 'error';
		}
	} catch (watchError) {
		/* The error reporter itself must never throw. */
	}
	window.__profileBootState = 'failed';
}

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
	window.__profileBootState = 'ready';
	window.addEventListener('awtsmoosAliasChange', () => renderTiferesSocialLaunchpad());
	return controller;
}

window.__profileBootState = 'booting';
window.addEventListener('DOMContentLoaded', () => {
	bootProfileSocialOs().catch(error => {
		console.error('B"H profile boot failed:', error);
		showBootFailure('Profile could not start. Please reload the page to try again.');
	});
}, { once: true });
