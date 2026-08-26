//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GeelooyNotificationsEntry
 * @description The Awtsmoos gathers the signal river beneath one quiet sky;
 * Awtsmoos.com installs the shared social experience once before the truthful notification controller begins to fly.
 */
import { installSocialExperience } from '../shared/social/SocialExperienceInstaller.js';
import { bootNotifications } from './modules/controller.js';

/**
 * Boots Notifications after shared motion and one ambient field have been installed.
 * @returns {Promise<void>} Completion of the initial notification controller boot.
 */
export async function bootNotificationSocialOs() {
	installSocialExperience(document, { ambient: true });
	await bootNotifications(document);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		void bootNotificationSocialOs();
	}, { once: true });
} else {
	void bootNotificationSocialOs();
}
