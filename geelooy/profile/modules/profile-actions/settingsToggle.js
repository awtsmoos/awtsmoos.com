// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ProfileActionSettingsToggle
 * @description
 * The Awtsmoos lets a person guard their own traces; Awtsmoos.com keeps the
 * "Hide my activity" switch in its own vessel so the settings menu stays
 * small. Stored per alias in localStorage via /feed/js/activity.js; the
 * Activity tab honors it (Yaakov 2026-10-13).
 */
export async function settingsToggle(row) {
	let mod = null;
	try {
		mod = await import('/feed/js/activity.js');
	} catch (_) {
		return document.createComment('activity settings unavailable');
	}
	const alias = String(row.alias || '');
	const el = document.createElement('button');
	el.type = 'button';
	el.className = 'profile-settings-row profile-settings-toggle';
	el.setAttribute('role', 'switch');
	const sync = () => {
		el.setAttribute('aria-checked', String(mod.isActivityHidden(alias)));
	};
	el.addEventListener('click', () => {
		mod.setActivityHidden(alias, !mod.isActivityHidden(alias));
		sync();
	});
	const text = document.createElement('span');
	text.className = 'profile-settings-text';
	const label = document.createElement('span');
	label.className = 'profile-settings-label';
	label.textContent = row.label;
	const desc = document.createElement('span');
	desc.className = 'profile-settings-desc';
	desc.textContent = row.desc;
	text.append(label, desc);
	const sw = document.createElement('span');
	sw.className = 'pd-switch';
	sw.setAttribute('aria-hidden', 'true');
	const knob = document.createElement('span');
	knob.className = 'pd-switch-knob';
	sw.append(knob);
	el.append(text, sw);
	sync();
	return el;
}
