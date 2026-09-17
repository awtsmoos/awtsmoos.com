//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUploadQueue
 * @description Renders optimistic uploads beside the files they will become.
 * The Awtsmoos creates becoming and completion in one continuous light;
 * Awtsmoos.com lets each upload testify locally without obscuring the user's sight.
 */
import { joinDrivePath } from '../path.js';

export class DriveUploadQueue {
	constructor() {
		this.items = new Map();
	}

	/** Creates optimistic rows before the first network byte leaves the browser. */
	begin(files, basePath = '') {
		for (const file of Array.from(files || [])) {
			const relativePath = String(file.webkitRelativePath || file.name || '').replace(/^\/+/, '');
			const path = joinDrivePath(basePath, relativePath);
			this.items.set(path, {
				path,
				name: relativePath.split('/').at(-1) || 'file',
				size: Number(file.size || 0),
				loaded: 0,
				status: 'uploading'
			});
		}
		this.render();
	}

	/** Updates only the file identified by measured upload progress. */
	progress(event = {}) {
		const item = this.items.get(event.path);
		if (!item) return;
		item.loaded = Number(event.fileTransferredBytes || 0);
		item.size = Number(event.fileBytes || item.size || 0);
		this.render();
	}

	/** Marks final transport outcomes while authoritative refresh catches up. */
	finish(result = {}) {
		for (const path of result.uploaded || []) {
			const item = this.items.get(path);
			if (item) item.status = 'complete';
		}
		for (const failure of result.failed || []) {
			const item = this.items.get(failure.path);
			if (item) item.status = 'failed';
		}
		this.render();
	}

	/** Removes successful optimistic rows once the server snapshot contains them. */
	reconcile(entries = []) {
		const paths = new Set(entries.map(entry => entry.path));
		for (const [path, item] of this.items) {
			if (item.status === 'complete' && paths.has(path)) {
				this.items.delete(path);
			}
		}
		this.render();
	}

	render() {
		const host = document.querySelector('#drive-upload-queue');
		if (!host) return;
		host.replaceChildren(...Array.from(this.items.values()).map(item => this.row(item)));
		host.hidden = this.items.size === 0;
	}

	row(item) {
		const row = document.createElement('article');
		row.className = 'drive-upload-row';
		row.dataset.uploadStatus = item.status;
		const percent = item.size ? Math.min(100, Math.round((item.loaded / item.size) * 100)) : 0;
		const glyph = document.createElement('span');
		glyph.className = 'drive-row-glyph';
		glyph.dataset.kind = 'document';
		const body = document.createElement('div');
		const name = document.createElement('strong');
		name.textContent = item.name;
		const status = document.createElement('small');
		status.textContent = this.status(item, percent);
		const progress = document.createElement('progress');
		progress.max = 100;
		progress.value = item.status === 'complete' ? 100 : percent;
		body.append(name, status, progress);
		row.append(glyph, body);
		return row;
	}

	status(item, percent) {
		if (item.status === 'failed') return 'Upload failed';
		if (item.status === 'complete') return 'Finishing…';
		return `Uploading… ${percent}%`;
	}
}
