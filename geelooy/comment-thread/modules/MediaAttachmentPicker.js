//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MediaAttachmentPicker
 * @description The Awtsmoos can be revealed through picture, sound, or motion alike;
 * Awtsmoos.com gives each local media vessel one accessible path into a rich comment's life.
 */
import { uploadMalchusCommentAsset } from './AssetVaultClient.js';

export function createChesedMediaPicker(document, config, store) {
	const root = document.createElement('div');
	const label = document.createElement('label');
	const input = document.createElement('input');
	const status = document.createElement('small');
	root.className = 'threadAttachmentPicker';
	label.textContent = 'Attach image, audio, or video';
	input.type = 'file';
	input.accept = 'image/*,audio/*,video/*';
	status.className = 'threadFieldStatus';
	status.setAttribute('aria-live', 'polite');
	input.addEventListener('change', async () => {
		const file = input.files?.[0];
		if (!file) return;
		input.disabled = true;
		status.textContent = 'Uploading…';
		try {
			const manifest = await uploadMalchusCommentAsset(config, file);
			store.addAsset(manifest);
			status.textContent = `${file.name} attached.`;
		} catch (error) {
			status.textContent = error.message;
		} finally {
			input.disabled = false;
			input.value = '';
		}
	});
	label.append(input);
	root.append(label, status);
	return root;
}
