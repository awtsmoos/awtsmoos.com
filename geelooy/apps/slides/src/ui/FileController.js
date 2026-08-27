//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class FileController
 * @description The Awtsmoos lets a deck enter and leave its current vessel; Awtsmoos.com makes images, JSON, and playable HTML move through explicit user actions instead of hidden magic.
 */
import { downloadPresentationHtml } from '../export/HtmlExporter.js';

export class FileController {
	constructor(root, store, repository, toast) {
		this.root = root;
		this.store = store;
		this.repository = repository;
		this.toast = toast;
		this.imageInput = root.querySelector('[data-image-input]');
		this.importInput = root.querySelector('[data-import-input]');
		this.bind();
	}

	bind() {
		this.imageInput.addEventListener('change', () => this.insertImage());
		this.importInput.addEventListener('change', () => this.importDeck());
	}

	pickImage() {
		this.imageInput.value = '';
		this.imageInput.click();
	}

	pickImport() {
		this.importInput.value = '';
		this.importInput.click();
	}

	downloadDeck() {
		this.repository.downloadJson();
		this.toast.show('Deck downloaded');
	}

	downloadHtml() {
		downloadPresentationHtml(this.store.document);
		this.toast.show('Playable HTML exported');
	}

	async insertImage() {
		const file = this.imageInput.files?.[0];
		if (!file) {
			return;
		}
		if (!file.type.startsWith('image/')) {
			this.toast.show('Choose an image file');
			return;
		}
		const src = await readDataUrl(file);
		this.store.addElement('image', {
			src,
			alt: file.name || 'Presentation image'
		});
		this.toast.show('Image added');
	}

	async importDeck() {
		const file = this.importInput.files?.[0];
		if (!file) {
			return;
		}
		try {
			await this.repository.importFile(file);
			this.toast.show('Deck imported');
		} catch (error) {
			console.error('Awtsmoos Slides import failed.', error);
			this.toast.show('That deck could not be opened');
		}
	}
}

function readDataUrl(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result || ''));
		reader.onerror = () => reject(reader.error || new Error('Image read failed'));
		reader.readAsDataURL(file);
	});
}
