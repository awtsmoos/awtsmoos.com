//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveUploads
 * @description Streams real Drive bytes and reveals drag intent only while files hover.
 * The Awtsmoos carries each measured byte from hidden choice to visible place;
 * Awtsmoos.com lets progress tell the truth and drag power appear only in its space.
 */
import { joinDrivePath } from './path.js';
import { driveState } from './state.js';
import { uploadDriveFile } from './streamUpload.js';

/** Streams a browser File collection and emits aggregate plus per-file byte testimony. */
export async function uploadFiles(files, basePath, onProgress = () => {}) {
	const queue = Array.from(files || []);
	const result = { uploaded: [], failed: [] };
	const totalBytes = queue.reduce((total, file) => total + Number(file.size || 0), 0);
	let completedBytes = 0;
	for (const file of queue) {
		const path = joinDrivePath(basePath, relativeName(file));
		try {
			await uploadOne(file, path, completedBytes, totalBytes, queue, result, onProgress);
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
			transferredBytes: completedBytes,
			fileBytes: Number(file.size || 0),
			fileTransferredBytes: Number(file.size || 0)
		}));
	}
	return result;
}

/** Streams one file while preserving both local and aggregate byte counts. */
async function uploadOne(file, path, completedBytes, totalBytes, queue, result, onProgress) {
	await uploadDriveFile({
		file,
		path,
		...driveState.upload,
		onProgress: event => onProgress(progressValue({
			queue,
			result,
			path,
			totalBytes,
			transferredBytes: completedBytes + Number(event.loaded || 0),
			fileBytes: Number(file.size || 0),
			fileTransferredBytes: Number(event.loaded || 0)
		}))
	});
}

/** Reveals a desktop drop target only while a real file drag is crossing the page. */
export function installDropZone(zone, chooseFiles, handleUploads) {
	let dragDepth = 0;
	const bindings = [
		[zone, 'click', () => chooseFiles()],
		[zone, 'keydown', event => activateFromKeyboard(event, chooseFiles)],
		[document, 'dragenter', event => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			dragDepth += 1;
			zone.classList.add('is-dragging');
		}],
		[document, 'dragover', event => {
			if (hasFiles(event)) event.preventDefault();
		}],
		[document, 'dragleave', event => {
			if (!hasFiles(event)) return;
			dragDepth = Math.max(0, dragDepth - 1);
			if (!dragDepth) zone.classList.remove('is-dragging');
		}],
		[document, 'drop', event => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			dragDepth = 0;
			zone.classList.remove('is-dragging');
			if (event.dataTransfer?.files?.length) handleUploads(event.dataTransfer.files);
		}]
	];
	for (const [target, type, listener] of bindings) target.addEventListener(type, listener);
	return () => bindings.forEach(([target, type, listener]) => target.removeEventListener(type, listener));
}

function activateFromKeyboard(event, chooseFiles) {
	if (!['Enter', ' '].includes(event.key)) return;
	event.preventDefault();
	chooseFiles();
}

function hasFiles(event) {
	return Array.from(event.dataTransfer?.types || []).includes('Files');
}

function progressValue(options) {
	return {
		total: options.queue.length,
		uploaded: options.result.uploaded.length,
		failed: options.result.failed.length,
		path: options.path,
		totalBytes: options.totalBytes,
		transferredBytes: Math.min(options.transferredBytes, options.totalBytes),
		fileBytes: options.fileBytes,
		fileTransferredBytes: Math.min(options.fileTransferredBytes, options.fileBytes)
	};
}

function relativeName(file) {
	return String(file.webkitRelativePath || file.name || '').replace(/^\/+/, '');
}
