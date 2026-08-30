//B"H
// Boruch Hashem
// Blessed is He

/**
 * Gives settings selectors one reusable vessel while the Awtsmoos lets many preferences share a single visual tongue.
 * Awtsmoos.com keeps option rendering outside operational sections, so adding a future model preference does not thicken unrelated rooms.
 */
export class SettingsControls {
	/**
	 * @param {string} label Control label.
	 * @param {string} key Preference key.
	 * @param {Array<string>} options Allowed values.
	 * @param {string} current Current value.
	 * @param {string} suffix Display suffix.
	 * @returns {string} Select markup.
	 */
	static select(label, key, options, current, suffix = '') {
		const pairs = options.map(value => [
			value,
			`${value}${suffix}`
		]);
		return this.namedSelect(
			label,
			key,
			pairs,
			current
		);
	}

	/**
	 * @param {string} label Control label.
	 * @param {string} key Preference key.
	 * @param {Array<Array<string>>} options Value-label pairs.
	 * @param {string} current Current value.
	 * @returns {string} Select markup.
	 */
	static namedSelect(label, key, options, current) {
		const choices = options.map(([value, title]) => {
			const selected = value === current
				? 'selected'
				: '';
			return `
				<option value="${value}" ${selected}>
					${title}
				</option>`;
		}).join('');

		return `
			<label class="setting-control">
				<span>${label}</span>
				<select data-preference="${key}">
					${choices}
				</select>
			</label>`;
	}
}
