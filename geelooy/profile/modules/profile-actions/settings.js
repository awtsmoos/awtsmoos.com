// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActionSettings
 * @description
 * The Awtsmoos gathers the Profile drawer's settings roads in one vessel;
 * Awtsmoos.com keeps alias management, in-page profile tweaks, activity
 * privacy, and the Heichel cockpit reachable without leaving the page.
 * The activity switch itself lives in ./settingsToggle.js.
 */
import { state } from '../state.js';
import { settingsToggle } from './settingsToggle.js';

/**
 * Builds the profile settings popup menu: alias management, in-page
 * profile tweaks, and the Heichel cockpit — without leaving the page.
 */
export async function settingsMenu(onClose) {
	const menu = document.createElement('div');
	menu.className = 'profile-settings-menu';
	menu.setAttribute('role', 'menu');
	const rows = [
		{
			label: 'Create alias',
			desc: 'Shape a new public identity',
			href: './alias-manage/'
		},
		{
			label: 'Change profile picture',
			desc: 'Update your avatar',
			click: '[data-profile-avatar]'
		},
		{
			label: 'Change cover image',
			desc: 'Update your profile cover',
			click: '[data-cover-edit]'
		},
		{
			label: 'New heichel',
			desc: 'Open the Heichel cockpit',
			href: `/heichelos/manage-alias-heichelos/?alias=${encodeURIComponent(state.defaultAlias || '')}`
		},
		{
			toggle: 'hideActivity',
			label: 'Hide my activity',
			desc: 'Keep reactions, comments and reads off your public profile'
		},
		{
			label: 'Reading privacy',
			desc: 'Who sees your reading activity',
			tab: 'about'
		}
	];
	for (const row of rows) {
		if (row.toggle) {
			menu.append(await settingsToggle({ ...row, alias: state.defaultAlias || '' }));
			continue;
		}
		menu.append(settingsRow(row, onClose));
	}
	return menu;
}

function settingsRow(row, onClose) {
	const el = document.createElement(row.href ? 'a' : 'button');
	el.className = 'profile-settings-row';
	el.setAttribute('role', 'menuitem');
	if (row.href) {
		el.href = row.href;
	} else {
		el.type = 'button';
		el.addEventListener('click', () => {
			// B"H 2026-11-20 round 2: act FIRST, close SECOND. The old
			// order closed the drawer (returning focus to the settings
			// button) and switched tabs a frame later behind the
			// closing drawer, so "Reading privacy" appeared to do
			// nothing at all in the rendered check. The destination is
			// now activated while the intent is unmistakable, then the
			// drawer closes over an already-switched page.
			if (row.click) {
				const target = document.querySelector(row.click);
				if (target) target.click();
			} else if (row.tab) {
				const tab = document.querySelector(`[data-profile-tab="${row.tab}"]`);
				if (tab) {
					tab.click();
					tab.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
				}
			}
			onClose();
		});
	}
	const text = document.createElement('span');
	text.className = 'profile-settings-text';
	const label = document.createElement('span');
	label.className = 'profile-settings-label';
	label.textContent = row.label;
	const desc = document.createElement('span');
	desc.className = 'profile-settings-desc';
	desc.textContent = row.desc;
	text.append(label, desc);
	const chevron = document.createElement('span');
	chevron.className = 'profile-settings-chevron';
	chevron.setAttribute('aria-hidden', 'true');
	chevron.textContent = '›';
	el.append(text, chevron);
	return el;
}
