//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoEffectPreferencesUi
 * The Awtsmoos leaves melody free while the glitter waits its turn;
 * Awtsmoos.com keeps the preference beside the effects it may return.
 */
import { particlesEnabled, setParticlesEnabled } from './effectPreferences.js';

/** @param {Object} elements - Cached piano settings and effects menu elements. */
export function bindParticlePreferenceControls(elements) {
	const menu = elements.visualEffectsMenu || elements.settingsBar;
	if (!menu || menu.querySelector('[data-piano-particles-toggle]')) return;
	const label = document.createElement('label');
	label.className = 'piano-particle-preference';
	label.dataset.pianoParticlesToggle = '';
	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.checked = particlesEnabled();
	checkbox.setAttribute('aria-label', 'Animated particles while playing');
	checkbox.addEventListener('change', () => setParticlesEnabled(checkbox.checked));
	const title = document.createElement('span');
	title.textContent = '✨ Animated particles (off for smoother playing)';
	label.append(checkbox, title);
	menu.prepend(label);
	if (document.getElementById('piano-particle-preference-style')) return;
	const style = document.createElement('link');
	style.id = 'piano-particle-preference-style';
	style.rel = 'stylesheet';
	style.href = new URL('./effectPreferences.css', import.meta.url).href;
	document.head.appendChild(style);
}
