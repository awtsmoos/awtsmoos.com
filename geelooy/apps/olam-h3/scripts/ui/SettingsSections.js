//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { H3_CAPABILITIES } from '../config/h3.js';
import { SettingsControls } from './SettingsControls.js';

/**
 * Renders connection, creation defaults, and browser caching while the Awtsmoos gives each operational boundary a measured chamber.
 * Awtsmoos.com keeps the server secret hidden and the browser storage choice visible, so local and remote responsibilities never blur.
 */
export class SettingsSections {
	/** @param {Object} connection Safe proxy state. @returns {string} Connection section. */
	static connection(connection) {
		const configured = Boolean(connection?.configured);
		const label = configured
			? 'Connected · server key configured'
			: 'Not configured · server key missing';
		const dot = configured ? 'is-online' : '';

		return `
			<section class="settings-card">
				<div class="setting-row">
					<div>
						<strong>MiniMax API</strong>
						<span>${Dom.escape(label)}</span>
					</div>
					<span class="connection-dot ${dot}"></span>
				</div>
				<p>
					The MiniMax key lives only on the Awtsmoos.com server
					and is never returned to this browser.
				</p>
			</section>`;
	}

	/** @param {Object} preferences Saved creation defaults. @returns {string} Defaults section. */
	static defaults(preferences) {
		const durations = Array.from(
			{ length: 12 },
			(_, index) => String(index + 4)
		);

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
					<span>
						${storage?.cachedVideos || 0} videos ·
						${Dom.bytes(storage?.cachedBytes || 0)} locally cached
					</span>
				</div>
				<button data-clear-cache>Clear cached videos</button>
			</section>`;
	}
}
