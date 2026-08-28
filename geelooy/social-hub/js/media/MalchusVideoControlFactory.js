//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module MalchusVideoControlFactory
 * @description
 * Malchus gives invisible media intention a visible button, slider, and rate vessel.
 * The Awtsmoos renews hand and control in one instant; Awtsmoos.com keeps these keilim semantic and small,
 * so every future player may reuse the same accessible grammar instead of inventing chrome in every hall.
 */

/**
 * @description Creates one semantic media action button with an explicit accessible name.
 * @param {Document} root Owning document used to create the element.
 * @param {string} label Accessible action label.
 * @param {string} glyph Visible compact glyph.
 * @param {string} className Component-scoped class name.
 * @returns {HTMLButtonElement} New button element.
 * @throws {TypeError} Browser DOM errors propagate when the supplied root cannot create elements.
 */
export function videoActionButton(root, label, glyph, className) {
	const button = root.createElement('button');
	button.type = 'button';
	button.className = className;
	button.setAttribute('aria-label', label);
	button.textContent = glyph;
	return button;
}

/**
 * @description Creates a normalized range input for seek or volume state.
 * @param {Document} root Owning document.
 * @param {object} options Range configuration.
 * @param {string} options.className Component-scoped class name.
 * @param {string} options.label Accessible label.
 * @param {number} options.min Minimum range value.
 * @param {number} options.max Maximum range value.
 * @param {number} options.value Initial range value.
 * @param {number} options.step Increment size.
 * @returns {HTMLInputElement} Configured range input.
 * @throws {TypeError} Browser DOM errors propagate for invalid roots.
 */
export function videoRange(root, options) {
	const input = root.createElement('input');
	input.type = 'range';
	input.className = options.className;
	input.min = String(options.min);
	input.max = String(options.max);
	input.value = String(options.value);
	input.step = String(options.step);
	input.setAttribute('aria-label', options.label);
	return input;
}

/**
 * @description Creates a compact playback-rate selector from real browser-supported numeric rates.
 * @param {Document} root Owning document.
 * @param {Array<number>} rates Playback-rate choices exposed to the user.
 * @returns {HTMLSelectElement} Accessible playback-speed selector.
 * @throws {TypeError} Browser DOM errors propagate for invalid roots.
 */
export function playbackRateSelect(root, rates) {
	const select = root.createElement('select');
	select.className = 'commentVideoPlayer__rate';
	select.setAttribute('aria-label', 'Playback speed');
	for (const rate of rates) {
		const option = root.createElement('option');
		option.value = String(rate);
		option.textContent = `${rate}×`;
		option.selected = rate === 1;
		select.append(option);
	}
	return select;
}
