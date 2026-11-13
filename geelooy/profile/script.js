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
	// B"H: tab binding is owned by ProfileDashboardController (binds before any network).
	bindProfileInlineActions();
	bindStatShortcuts();
	const controller = new ProfileDashboardController();
	await controller.start();
	// B"H social fix 3 (defect 6): the old post-boot .click() on the Posts
	// tab is GONE. It fired after controller.start() resolved — seconds
	// into the page, while the user may already have clicked another tab
	// — and forced Posts back on, which is exactly the reported symptom
	// (a click was applied, then "Posts stayed selected"). The controller
	// now pre-loads the Posts CONTENT inside load(), without activating
	// the tab or clicking it; the click path belongs to the user only.
	window.__profileBootState = 'ready';
	window.addEventListener('awtsmoosAliasChange', () => renderTiferesSocialLaunchpad());
	return controller;
}

/** Stat buttons in the hero jump straight to their tab. */
function bindStatShortcuts() {
	document.querySelectorAll('[data-goto-tab]').forEach(button => {
		button.addEventListener('click', () => {
			const key = button.getAttribute('data-goto-tab');
			const tab = key && document.querySelector(`[data-profile-tab="${key}"]`);
			if (tab) {
				tab.click();
				tab.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			}
		});
	});
}

window.__profileBootState = 'booting';
window.addEventListener('DOMContentLoaded', () => {
	bootProfileSocialOs().catch(error => {
		console.error('B"H profile boot failed:', error);
		showBootFailure('Profile could not start. Please reload the page to try again.');
	});
}, { once: true });
