//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveUploads
 * @description
 * The Awtsmoos joins chosen and dropped files to their alias root without duplicating bytes;
 * Awtsmoos.com keeps drop-zone interaction and streaming upload transport in one measured vessel while callers retain one upload callback.
 */

import { joinDrivePath } from './path.js';
import { driveState } from './state.js';
import { uploadDriveFile } from './streamUpload.js';

/** Streams a browser File collection directly into Drive with aggregate progress testimony. */
export async function uploadFiles(files, basePath, onProgress = () => {}) {
	const queue = Array.from(files || []);
	const result = { uploaded: [], failed: [] };
	const totalBytes = queue.reduce((total, file) => total + Number(file.size || 0), 0);
	let completedBytes = 0;
	for (const file of queue) {
		const path = joinDrivePath(basePath, relativeName(file));
		try {
			await uploadDriveFile({
				file,
				path,
				...driveState.upload,
				onProgress: event => onProgress(progressValue({
					queue,
					result,
					path,
					totalBytes,
					transferredBytes: completedBytes + event.loaded
				}))
			});
			result.uploaded.push(path);
		} catch (error) {
			result.failed.push({ path, error });
		}
		completedBytes += Number(file.size || 0);
		onProgress(progressValue({
			queue,
			result,
			path,
			totalBytes,
			transferredBytes: completedBytes
		}));
	}
	return result;
}

/**
 * Installs keyboard, click, drag, and drop behavior on one visible Drive drop zone.
 * @param {HTMLElement} zone Interactive drop target.
 * @param {Function} chooseFiles Opens the hidden file picker.
 * @param {Function} handleUploads Receives the dropped FileList.
 * @returns {Function} Removes every installed listener.
 */
export function installDropZone(zone, chooseFiles, handleUploads) {
	const listeners = [
		['click', () => chooseFiles()],
		['keydown', event => activateFromKeyboard(event, chooseFiles)],
		['dragenter', event => setDragState(event, zone, true)],
		['dragover', event => setDragState(event, zone, true)],
		['dragleave', event => setDragState(event, zone, false)],
		['drop', event => handleDrop(event, zone, handleUploads)]
	];
	for (const [type, listener] of listeners) {
		zone.addEventListener(type, listener);
	}
	return () => {
		for (const [type, listener] of listeners) {
			zone.removeEventListener(type, listener);
		}
	};
}

function activateFromKeyboard(event, chooseFiles) {
	if (event.key !== 'Enter' && event.key !== ' ') {
		return;
	}
	event.preventDefault();
	chooseFiles();
}

function setDragState(event, zone, active) {
	event.preventDefault();
	zone.classList.toggle('is-dragging', active);
}

function handleDrop(event, zone, handleUploads) {
	event.preventDefault();
	zone.classList.remove('is-dragging');
	const files = event.dataTransfer?.files;
	if (files?.length) {
		handleUploads(files);
	}
}

function progressValue(options) {
	return {
		total: options.queue.length,
		uploaded: options.result.uploaded.length,
		failed: options.result.failed.length,
		path: options.path,
		totalBytes: options.totalBytes,
		transferredBytes: Math.min(options.transferredBytes, options.totalBytes)
	};
}

function relativeName(file) {
	return String(file.webkitRelativePath || file.name || '').replace(/^\/+/, '');
}
