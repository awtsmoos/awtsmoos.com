// B"H

import { applySettings } from '../../js/settings/applySettings.js';
import { DEFAULT_SETTINGS, SETTINGS_KEY } from '../../js/settings/defaultSettings.js';
import { createSettingsStore } from '../../js/settings/settingsStore.js';
import { getRenderPreferences, setRenderPreferences } from '../../js/rendering/renderPreferences.js';

class FakeStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
	removeItem(key) {
		this.values.delete(key);
	}
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const storage = new FakeStorage();
const store = createSettingsStore(storage);
const defaults = store.load();
assert(defaults.uiScale === DEFAULT_SETTINGS.uiScale, 'Missing settings must load defaults.');
assert(defaults.haptics, 'Default haptics should be enabled.');

const saved = store.save({
	haptics: false,
	highContrast: true,
	joystickSensitivity: 99,
	particleDensity: -4,
	touchOpacity: 0,
	uiScale: 9,
	unknownPreference: 'ignored'
});
assert(saved.joystickSensitivity === 1.5, 'Joystick sensitivity must clamp.');
assert(saved.particleDensity === 0, 'Particle density must clamp.');
assert(saved.touchOpacity === 0.45, 'Touch opacity must clamp.');
assert(saved.uiScale === 1.25, 'UI scale must clamp.');
assert(!('unknownPreference' in saved), 'Unknown settings must be ignored.');
assert(store.load().highContrast, 'Settings must survive reload.');
assert(!storage.getItem('scribe_save_v1'), 'Settings must never write the progress key.');

const styleValues = new Map();
const root = { style: { setProperty: (name, value) => styleValues.set(name, value) } };
const body = { dataset: {} };
applySettings(saved, { root, body });
assert(body.dataset.highContrast === 'true', 'High contrast must reach the body dataset.');
assert(body.dataset.haptics === 'false', 'Haptics must reach the body dataset.');
assert(styleValues.get('--ui-scale') === '1.25', 'UI scale must reach CSS variables.');
assert(styleValues.get('--touch-opacity') === '0.45', 'Touch opacity must reach CSS variables.');

setRenderPreferences({ reducedMotion: true, screenShake: false, particleDensity: 0.25, weatherEffects: false });
const renderPreferences = getRenderPreferences();
assert(renderPreferences.reducedMotion, 'Reduced motion must reach rendering policy.');
assert(!renderPreferences.screenShake, 'Screen shake preference must reach rendering policy.');
assert(!renderPreferences.weatherEffects, 'Weather preference must reach rendering policy.');

const reset = store.reset();
assert(reset.uiScale === DEFAULT_SETTINGS.uiScale, 'Reset must restore defaults.');
assert(!storage.getItem(SETTINGS_KEY), 'Reset must remove only the settings record.');

console.log(JSON.stringify({ ok: true, checks: 17, settings: Object.keys(saved).length }));
