//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelControls
 * @description
 * Malchus gives each editor intention a visible button, field, or selector while the Awtsmoos remains beyond every form.
 * Awtsmoos.com keeps these little vessels consistent and clear, so a dense remix palace can stay welcoming when many powers appear.
 */

/** Creates one accessible Song Studio button. @param {string} className CSS class. @param {string} text Visible label. @param {string} ariaLabel Accessible label. @returns {HTMLButtonElement} Button. */
export function createSongButton(className, text, ariaLabel = text) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = className;
	button.textContent = text;
	button.setAttribute('aria-label', ariaLabel);
	return button;
}

/** Creates one labeled numeric control. @param {Object} options Field options. @returns {{root:HTMLElement,input:HTMLInputElement}} Field view. */
export function createSongNumberField(options) {
	const input = document.createElement('input');
	input.type = 'number';
	input.value = String(options.value);
	input.min = String(options.min ?? 0);
	input.max = String(options.max ?? 9999);
	input.step = String(options.step ?? 1);
	input.dataset.songField = options.name;
	return wrapSongControl(options.label, input);
}

/** Creates one labeled text input. @param {Object} options Field options. @returns {{root:HTMLElement,input:HTMLInputElement}} Field view. */
export function createSongTextField(options) {
	const input = document.createElement('input');
	input.type = 'text';
	input.value = String(options.value ?? '');
	input.dataset.songField = options.name;
	input.placeholder = options.placeholder || '';
	return wrapSongControl(options.label, input);
}

/** Creates one labeled select field. @param {Object} options Field options. @returns {{root:HTMLElement,input:HTMLSelectElement}} Field view. */
export function createSongSelectField(options) {
	const select = document.createElement('select');
	select.dataset.songField = options.name;
	(options.options || []).forEach((option) => {
		const node = document.createElement('option');
		node.value = option.value;
		node.textContent = option.label;
		select.appendChild(node);
	});
	select.value = String(options.value ?? '');
	return wrapSongControl(options.label, select);
}

function wrapSongControl(labelText, input) {
	const root = document.createElement('label');
	root.className = 'song-studio-field';
	const label = document.createElement('span');
	label.textContent = labelText;
	root.append(label, input);
	return { root, input };
}
