//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';
import { SettingsControls } from './SettingsControls.js';
import { MiniMaxSetupView } from './MiniMaxSetupView.js';

/**
 * Renders provider setup, creation defaults, and browser caching while the Awtsmoos gives every operational boundary a measured chamber; Awtsmoos.com keeps server secrets out of browser concerns and makes configuration steps explicit enough to follow without guesswork.
 */
export class SettingsSections {
	/** @param {Object} connection Safe proxy state. @returns {string} Provider setup section. */
	static connection(connection) {
		return MiniMaxSetupView.render(connection);
	}

	/** @param {Object} preferences Saved creation defaults. @returns {string} Defaults section. */
	static defaults(preferences) {
		const durations = Array.from({ length: 12 }, (_, index) => String(index + 4));

		return `
			<section class="settings-card">
				<h2>Creation defaults</h2>
				${SettingsControls.select('Default resolution', 'defaultResolution', H3_CAPABILITIES.resolutions, preferences.defaultResolution)}
				${SettingsControls.select('Default duration', 'defaultDuration', durations, String(preferences.defaultDuration), 's')}
				${SettingsControls.select('Default aspect ratio', 'defaultAspectRatio', H3_CAPABILITIES.ratios, preferences.defaultAspectRatio)}
			</section>`;
	}

	/** @param {Object} preferences Preferences. @param {Object} storage Storage metrics. @returns {string} Cache section. */
	static cache(preferences, storage) {
		const storageLabel = storage?.quota
			? `${Dom.bytes(storage.usage)} of ${Dom.bytes(storage.quota)} browser storage`
			: 'Browser storage estimate unavailable';
		const options = [
			['never', 'Never'],
			['ask', 'Ask after completion'],
			['automatic', 'Automatically cache']
		];

		return `
			<section class="settings-card">
				<h2>Video caching</h2>
				${SettingsControls.namedSelect('Completed videos', 'cachePreference', options, preferences.cachePreference)}
				<div class="storage-summary">
					<strong>${storageLabel}</strong>
					<span>${storage?.cachedVideos || 0} videos · ${Dom.bytes(storage?.cachedBytes || 0)} locally cached</span>
				</div>
				<button data-clear-cache>Clear cached videos</button>
			</section>`;
	}
}
