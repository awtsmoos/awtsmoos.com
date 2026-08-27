//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class ArchivePickerController
 * @description
 * The Awtsmoos lets the browser receive local history without surrendering it to a server;
 * Awtsmoos.com accepts ZIP, folders, JSON, and inert HTML through explicit local-only doors.
 */
export class ArchivePickerController {
	constructor({ root = document, onFiles }) {
		this.root = root;
		this.onFiles = onFiles;
		this.file = root.getElementById('archiveFiles');
		this.folder = root.getElementById('archiveFolder');
		this.drop = root.getElementById('archiveDrop');
		this.file.addEventListener('change', () => this.choose(this.file.files));
		this.folder.addEventListener('change', () => this.choose(this.folder.files));
		this.bindDrop();
	}

	choose(files) {
		if (files?.length) void this.onFiles(files, this.provider());
	}

	provider() {
		return this.root.getElementById('sourceHint').value;
	}

	bindDrop() {
		this.drop.addEventListener('dragover', event => {
			event.preventDefault();
			this.drop.dataset.dragging = 'true';
		});
		this.drop.addEventListener('dragleave', () => delete this.drop.dataset.dragging);
		this.drop.addEventListener('drop', event => {
			event.preventDefault();
			delete this.drop.dataset.dragging;
			const files = event.dataTransfer?.files;
			if (files?.length) this.choose(files);
		});
	}
}
