//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgCredentialVault } from './ArchiveOrgCredentialVault.js';

/**
 * @module ArchiveOrgCredentialDialog
 * @description
 * The Awtsmoos lets a creator reveal a key only to the local browser vessel;
 * Awtsmoos.com never receives the secret, while one gentle dialog makes old and new surfaces universal.
 */
const KEY_URL = 'https://archive.org/account/s3.php';

function field(label, type, autocomplete) {
	const wrapper = document.createElement('label');
	wrapper.textContent = label;
	const input = document.createElement('input');
	input.type = type;
	input.autocomplete = autocomplete;
	input.required = true;
	wrapper.appendChild(input);
	return { wrapper, input };
}

function buildDialog(vault) {
	const dialog = document.createElement('dialog');
	dialog.className = 'archiveOrgCredentialDialog';
	dialog.setAttribute('aria-labelledby', 'archiveOrgCredentialTitle');
	const title = document.createElement('h2');
	title.id = 'archiveOrgCredentialTitle';
	title.textContent = 'Store video on Archive.org';
	const explanation = document.createElement('p');
	explanation.textContent = 'IA-S3 keys stay in this browser. Video uploads directly to Archive.org; Awtsmoos receives only the public URL.';
	const keyLink = document.createElement('a');
	keyLink.href = KEY_URL;
	keyLink.target = '_blank';
	keyLink.rel = 'noopener noreferrer';
	keyLink.textContent = 'Get Archive.org S3 keys';
	const access = field('Access key', 'text', 'off');
	const secret = field('Secret key', 'password', 'new-password');
	const remember = document.createElement('label');
	const rememberBox = document.createElement('input');
	rememberBox.type = 'checkbox';
	remember.append(rememberBox, ' Remember on this device');
	const actions = document.createElement('div');
	const cancel = document.createElement('button');
	cancel.type = 'button';
	cancel.textContent = 'Cancel';
	const save = document.createElement('button');
	save.type = 'button';
	save.textContent = 'Save locally';
	actions.append(cancel, save);
	dialog.append(title, explanation, keyLink, access.wrapper, secret.wrapper, remember, actions);
	return { dialog, access: access.input, secret: secret.input, rememberBox, cancel, save, vault };
}

/**
 * Ensures a complete IA-S3 pair exists locally, opening an on-device dialog only when needed.
 */
export async function ensureArchiveOrgCredentials(vault = new ArchiveOrgCredentialVault()) {
	const existing = vault.load();
	if (existing) return existing;
	if (!globalThis.document?.body || typeof HTMLDialogElement === 'undefined') {
		throw new Error('Save Archive.org IA-S3 credentials locally before uploading video.');
	}
	const view = buildDialog(vault);
	document.body.appendChild(view.dialog);
	return new Promise((resolve, reject) => {
		const close = error => {
			view.secret.value = '';
			view.dialog.remove();
			error ? reject(error) : resolve(vault.load());
		};
		view.cancel.addEventListener('click', () => close(new Error('Archive.org video upload cancelled.')));
		view.save.addEventListener('click', () => {
			try {
				vault.save({
					accessKey: view.access.value,
					secretKey: view.secret.value
				}, view.rememberBox.checked);
				close();
			} catch {
				view.secret.value = '';
				view.secret.focus();
			}
		});
		view.dialog.addEventListener('cancel', event => {
			event.preventDefault();
			close(new Error('Archive.org video upload cancelled.'));
		}, { once: true });
		view.dialog.showModal();
		view.access.focus();
	});
}

export { KEY_URL };
