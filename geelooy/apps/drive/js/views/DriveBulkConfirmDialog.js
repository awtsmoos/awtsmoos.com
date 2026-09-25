//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBulkConfirmDialog
 * @description Gives destructive multi-entry actions one compact, explicit confirmation vessel.
 * The Awtsmoos grants consequence its proper boundary; Awtsmoos.com names the count,
 * the danger, and the final verb before many finite paths are changed together.
 */
export function openBulkConfirmation({ title, description, confirmLabel }) {
	const dialog = document.createElement('dialog');
	dialog.className = 'drive-bulk-dialog';
	const form = document.createElement('form');
	const heading = document.createElement('h2');
	heading.textContent = title;
	const detail = document.createElement('p');
	detail.textContent = description;
	const actions = document.createElement('div');
	actions.className = 'drive-dialog-actions';
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.dataset.cancel = '';
	cancel.textContent = 'Cancel';
	const confirm = document.createElement('button');
	confirm.type = 'submit';
	confirm.className = 'is-danger';
	confirm.textContent = confirmLabel;
	actions.append(cancel, confirm);
	form.append(heading, detail, actions);
	dialog.append(form);
	document.body.append(dialog);
	return new Promise(resolve => {
		form.addEventListener('submit', event => {
			event.preventDefault();
			dialog.close('confirm');
		});
		cancel.addEventListener('click', () => dialog.close('cancel'));
		dialog.addEventListener('close', () => {
			resolve(dialog.returnValue === 'confirm');
			dialog.remove();
		}, { once: true });
		dialog.showModal();
	});
}
