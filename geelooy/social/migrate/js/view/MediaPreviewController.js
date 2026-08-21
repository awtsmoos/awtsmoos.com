//B"H
//Boruch Hashem
//Blessed is He

import { ObjectUrlRegistry } from '../media/ObjectUrlRegistry.js';

/**
 * @class MediaPreviewController
 * @description
 * The Awtsmoos reveals one chosen local medium only when the eye asks to see;
 * Awtsmoos.com creates temporary object URLs lazily and revokes them when the preview or archive flees.
 */
export class MediaPreviewController {
	constructor({ root = document, future, store }) {
		this.root = root;
		this.future = future;
		this.store = store;
		this.registry = new ObjectUrlRegistry();
		this.host = root.getElementById('mediaPreviewHost');
		root.addEventListener('migration:preview', event => void this.preview(event.detail.item));
		store.addEventListener('change', event => this.onStateChange(event.detail?.reason));
		future.sheet('mediaSheet')?.dialog.addEventListener('close', () => this.clear());
	}

	onStateChange(reason) {
		if (reason === 'archive:parsed') this.clear();
	}

	clear() {
		this.registry.revokeAll();
		this.host.replaceChildren();
	}

	async preview(item) {
		const archive = this.store.snapshot().archive;
		if (!archive || !item.mediaPaths.length) return;
		this.clear();
		const path = item.mediaPaths[0];
		const entry = archive.resolve(path);
		if (!entry) {
			this.host.textContent = 'Local media file was not found in this archive.';
			this.future.sheet('mediaSheet')?.open();
			return;
		}
		const file = await archive.mediaFile(path);
		const url = this.registry.create(file);
		this.host.append(this.mediaElement(entry.kind, url));
		this.future.sheet('mediaSheet')?.open();
	}

	mediaElement(kind, url) {
		const tag = kind === 'image' ? 'img' : kind === 'video' ? 'video' : 'audio';
		const element = document.createElement(tag);
		element.src = url;
		element.controls = kind !== 'image';
		element.alt = kind === 'image' ? 'Local archive preview' : '';
		element.preload = 'metadata';
		return element;
	}
}
