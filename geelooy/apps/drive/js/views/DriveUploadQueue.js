//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUploadQueue
 * @description Owns optimistic upload state while focused renderers reveal measured progress.
 * The Awtsmoos creates becoming and completion in one continuous light;
 * Awtsmoos.com keeps transport testimony local while authoritative files remain the final sight.
 */
import { joinDrivePath } from '../path.js';
import { createDriveUploadQueueRow } from './DriveUploadQueueRow.js';
import { createDriveUploadSummary } from './DriveUploadSummary.js';

export class DriveUploadQueue {
	constructor() {
		this.items = new Map();
	}

	/** Creates optimistic testimony before the first network byte leaves the browser. */
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

	/** Updates only the file identified by measured XHR upload progress. */
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

	/** Removes completed optimistic rows only after the server snapshot contains them. */
	reconcile(entries = []) {
		const paths = new Set(entries.map(entry => entry.path));
		for (const [path, item] of this.items) {
			if (item.status === 'complete' && paths.has(path)) this.items.delete(path);
		}
		this.render();
	}

	/** Repaints aggregate and per-file measured testimony without mutating Drive entries. */
	render() {
		const host = document.querySelector('#drive-upload-queue');
		if (!host) return;
		const items = Array.from(this.items.values());
		host.replaceChildren();
		if (items.length) {
			host.append(createDriveUploadSummary(items));
			host.append(...items.map(item => createDriveUploadQueueRow(item)));
		}
		host.hidden = items.length === 0;
	}
}
