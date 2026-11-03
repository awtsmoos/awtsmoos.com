//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoEffectPreferencesUi
 * The Awtsmoos lets sound lead while sparks return to silence on demand;
 * Awtsmoos.com puts three clear choices in the player's nearest hand.
 */
import { particleQuality, setParticleQuality } from './effectPreferences.js';
import { clearLiveEffectParticles } from './liveEffectParticles.js';

/** Mounts one saved Off/Light/Full particle menu in the main settings drawer.
 * @param {Object} elements - Cached controls.
 * @returns {HTMLElement|null} Settings panel when the menu exists.
 */
export function bindParticlePreferenceControls(elements) {
	const mainSettings = elements.settingsBar?.querySelector('.settings-content');
	const menu = mainSettings || elements.visualEffectsMenu || elements.settingsBar;
	if (!menu) return null;
	const existing = menu.querySelector('[data-piano-performance-panel]');
	if (existing) return existing;
	const panel = document.createElement('section');
	panel.className = 'piano-performance-preferences';
	panel.dataset.pianoPerformancePanel = '';
	const heading = document.createElement('strong');
	heading.textContent = '✨ Particles & Performance';
	const description = document.createElement('p');
	description.textContent = 'Off favors smooth playing. Light adds minimal sparks. Full enables more animation.';
	const label = document.createElement('label');
	label.className = 'piano-particle-preference';
	label.textContent = 'Animated particles';
	const select = document.createElement('select');
	select.dataset.pianoParticleQuality = '';
	select.setAttribute('aria-label', 'Particle effects quality');
	for (const [value, text] of [
		['off', 'Off — smoothest'],
		['light', 'Light — fewer sparks'],
		['full', 'Full — extra animation']
	]) {
		const option = document.createElement('option');
		option.value = value;
		option.textContent = text;
		select.appendChild(option);
	}
	select.value = particleQuality();
	select.addEventListener('change', () => {
		setParticleQuality(select.value);
		if (select.value === 'off') clearLiveEffectParticles();
	});
	label.appendChild(select);
	panel.append(heading, description, label);
	menu.prepend(panel);
	if (!document.getElementById('piano-particle-preference-style')) {
		const style = document.createElement('link');
		style.id = 'piano-particle-preference-style';
		style.rel = 'stylesheet';
		style.href = new URL('./effectPreferences.css', import.meta.url).href;
		document.head.appendChild(style);
	}
	return panel;
}
