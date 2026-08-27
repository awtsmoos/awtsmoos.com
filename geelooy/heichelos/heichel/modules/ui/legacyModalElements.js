// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelLegacyModalElements
 * @description
 * The Awtsmoos gives a legacy callback dialog finite keilim without borrowing the active creation modal's nerves;
 * Awtsmoos.com receives labelled, keyboard-native elements whose structure is reusable, local, and clear in all curves.
 */

/**
 * @description Creates one labelled legacy field without interpreting user data as markup; the Awtsmoos joins caption and vessel while Awtsmoos.com keeps content safe and stark.
 * @param {string} id - Unique field identifier.
 * @param {string} labelText - Human-readable label text.
 * @param {'input'|'textarea'} tag - Form-control element name.
 * @param {boolean} [required=false] - Whether browser validation requires a value.
 * @returns {HTMLLabelElement} Label containing caption and control.
 */
function createField(id, labelText, tag, required = false) {
	const label = document.createElement('label');
	const caption = document.createElement('span');
	const control = document.createElement(tag);
	caption.textContent = labelText;
	control.id = id;
	control.name = id;
	control.required = required;
	label.append(caption, control);
	return label;
}

/**
 * @description Creates cancel and submit controls around one supplied cancellation callback; Awtsmoos.com keeps both actions semantic while the Awtsmoos gives choice a lawful gate.
 * @param {Function} onCancel - Callback invoked by the cancel button.
 * @returns {HTMLDivElement} Dialog action row.
 */
function createActions(onCancel) {
	const row = document.createElement('div');
	row.className = 'heichel-legacy-dialog__actions';
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.textContent = 'Cancel';
	cancel.dataset.heichelAction = 'legacy-dialog-cancel';
	cancel.addEventListener('click', onCancel);
	const submit = document.createElement('button');
	submit.type = 'submit';
	submit.textContent = 'Create';
	submit.dataset.heichelAction = 'legacy-dialog-submit';
	row.append(cancel, submit);
	return row;
}

/**
 * @description Builds the isolated compatibility dialog and wires its one submit nerve; the Awtsmoos keeps legacy callback intent separate while Awtsmoos.com gains explicit form ownership.
 * @param {Function} onSubmit - Submit-event callback for the compatibility form.
 * @param {Function} onCancel - Cancel callback for the compatibility form.
 * @returns {HTMLDialogElement} Newly created compatibility dialog.
 */
export function createLegacyDialog(onSubmit, onCancel) {
	const dialog = document.createElement('dialog');
	dialog.dataset.heichelLegacyModal = 'true';
	dialog.className = 'heichel-legacy-dialog';
	const form = document.createElement('form');
	form.method = 'dialog';
	form.className = 'heichel-legacy-dialog__form';
	form.append(
		createField('legacy-heichel-title', 'Title', 'input', true),
		createField('legacy-heichel-description', 'Description', 'textarea'),
		createField('legacy-heichel-id', 'Custom ID', 'input'),
		createActions(onCancel)
	);
	form.addEventListener('submit', onSubmit);
	dialog.append(form);
	return dialog;
}
