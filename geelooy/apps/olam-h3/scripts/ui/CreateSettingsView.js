//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES, ratiosForMode } from '../config/h3.js';

/**
 * Reveals H3 controls in one compact chamber while the Awtsmoos lets model limits remain explicit instead of multiplying across the page.
 * Awtsmoos.com builds resolution, time, and ratio controls from capability truth so tomorrow's provider can change without UI decay.
 */
export class CreateSettingsView {
	/** @param {Object} draft Current generation draft. @returns {string} Settings markup. */
	static render(draft) {
		return `
			<details class="creator-section settings-panel">
				<summary>
					<div>
						<span class="eyebrow">Model controls</span>
						<h2>${draft.resolution} · ${draft.duration}s · ${draft.aspectRatio}</h2>
					</div>
					<span>Adjust</span>
				</summary>
				<div class="settings-grid">
					${this.model()}
					${this.select('Resolution', 'resolution', H3_CAPABILITIES.resolutions, draft.resolution)}
					${this.duration(draft.duration)}
					${this.select('Aspect ratio', 'aspectRatio', ratiosForMode(draft.mode), draft.aspectRatio)}
				</div>
			</details>`;
	}

	/** @returns {string} Fixed model selector markup. */
	static model() {
		return `
			<label>
				Model
				<select disabled><option>MiniMax H3</option></select>
			</label>`;
	}

	/** @param {number} current Current duration. @returns {string} Duration selector markup. */
	static duration(current) {
		const count = H3_CAPABILITIES.duration.max
			- H3_CAPABILITIES.duration.min
			+ 1;
		const options = Array.from(
			{ length: count },
			(_, index) => H3_CAPABILITIES.duration.min + index
		);
		return this.select(
			'Duration',
			'duration',
			options,
			Number(current),
			's'
		);
	}

	/**
	 * @param {string} label Control label.
	 * @param {string} key Setting key.
	 * @param {Array} options Allowed values.
	 * @param {*} current Current value.
	 * @param {string} suffix Display suffix.
	 * @returns {string} Select markup.
	 */
	static select(label, key, options, current, suffix = '') {
		const choices = options.map(value => {
			const selected = value === current ? 'selected' : '';
			return `
				<option value="${value}" ${selected}>
					${value}${suffix}
				</option>`;
		}).join('');

		return `
			<label>
				${label}
				<select data-setting="${key}">${choices}</select>
			</label>`;
	}
}
