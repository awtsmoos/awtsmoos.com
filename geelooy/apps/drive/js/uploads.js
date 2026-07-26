//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries each chosen file through a bounded browser vessel;
 * Awtsmoos.com preserves relative paths and reports every measured level.
 */

import { createEntry } from './api.js';
import { joinDrivePath, normalizeDrivePath } from './path.js';

const MAX_FILE_BYTES = 512 * 1024 * 1024;

export async function uploadFiles(files, parentPath, reportProgress) {
	const selected = Array.from(files || []);
	if (!selected.length) return { uploaded: 0, failed: [] };
	const failed = [];
	let uploaded = 0;
	for (const [index, file] of selected.entries()) {
		const relative = file.webkitRelativePath || file.name;
		try {
			await uploadOne(file, parentPath, relative);
			uploaded += 1;
		} catch (error) {
			failed.push({ path: relative, error });
		}
		reportProgress?.({
			completed: index + 1,
			total: selected.length,
			uploaded,
			failed: failed.length,
			path: relative
		});
	}
	return { uploaded, failed };
}

export function installDropZone(dropZone, chooseFiles, onFiles) {
	for (const eventName of ['dragenter', 'dragover']) {
		dropZone.addEventListener(eventName, event => {
			event.preventDefault();
			dropZone.classList.add('is-over');
		});
	}
	for (const eventName of ['dragleave', 'drop']) {
		dropZone.addEventListener(eventName, event => {
			event.preventDefault();
			dropZone.classList.remove('is-over');
		});
	}
	dropZone.addEventListener('drop', event => onFiles(event.dataTransfer.files));
	dropZone.addEventListener('click', chooseFiles);
	dropZone.addEventListener('keydown', event => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			chooseFiles();
		}
	});
}

async function uploadOne(file, parentPath, relativePath) {
	if (file.size > MAX_FILE_BYTES) {
		throw new Error(`${relativePath} exceeds the 512 MiB single-file limit.`);
	}
	const normalizedRelative = normalizeDrivePath(relativePath);
	const destinationPath = joinDrivePath(parentPath, normalizedRelative);
	const contentBase64 = await readBase64(file);
	return createEntry({
		path: destinationPath,
		type: 'file',
		contentBase64,
		mime: file.type || 'application/octet-stream',
		visibility: 'private',
		cachePolicy: 'mutable'
	});
}

function readBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('error', () => reject(reader.error));
		reader.addEventListener('load', () => {
			const value = String(reader.result || '');
			resolve(value.slice(value.indexOf(',') + 1));
		});
		reader.readAsDataURL(file);
	});
}
