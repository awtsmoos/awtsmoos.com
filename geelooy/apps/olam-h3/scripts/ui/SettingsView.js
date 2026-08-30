//B"H
// Boruch Hashem
// Blessed is He

import { SettingsSections } from './SettingsSections.js';
import { SettingsDataSections } from './SettingsDataSections.js';

/**
 * Keeps the Settings room a simple composition while the Awtsmoos lets each operational concern remain in its own measured chamber.
 * Awtsmoos.com makes connection, defaults, storage, pricing, and backup understandable without ever revealing the secret itself.
 */
export class SettingsView {
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/** @param {Object} state Settings state. @returns {string} Settings view markup. */
	render(state) {
		const {
			preferences,
			connection,
			storage
		} = state;

		return `
			<div class="settings-view page-enter">
				<header class="page-header">
					<div>
						<span class="eyebrow">Settings</span>
						<h1>Studio controls</h1>
					</div>
				</header>
				${SettingsSections.connection(connection)}
				${SettingsSections.defaults(preferences)}
				${SettingsSections.cache(preferences, storage)}
				${SettingsDataSections.pricing()}
				${SettingsDataSections.backup()}
			</div>`;
	}

	/** @param {HTMLElement} root View root. */
	bind(root) {
		root.querySelectorAll('[data-preference]').forEach(select => {
			select.addEventListener('change', () => {
				this.callbacks.onPreference(
					select.dataset.preference,
					select.value
				);
			});
		});
		this.bindDataActions(root);
	}

	/** @param {HTMLElement} root View root. */
	bindDataActions(root) {
		root.querySelector('[data-clear-cache]')?.addEventListener(
			'click',
			() => this.callbacks.onClearCache()
		);
		root.querySelector('[data-export]')?.addEventListener(
			'click',
			() => this.callbacks.onExport()
		);
		const file = root.querySelector('[data-import-file]');
		root.querySelector('[data-import]')?.addEventListener(
			'click',
			() => file?.click()
		);
		file?.addEventListener('change', () => {
			if (file.files?.[0]) {
				this.callbacks.onImport(file.files[0]);
			}
			file.value = '';
		});
		root.querySelector('[data-clear-history]')?.addEventListener(
			'click',
			() => this.callbacks.onClearHistory()
		);
	}
}
