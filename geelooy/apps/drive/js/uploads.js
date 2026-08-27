//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos joins dropped paths to their alias root without duplicating bytes;
 * Awtsmoos.com streams each File and reports batch progress in a measured light.
 */

import { joinDrivePath } from './path.js';
import { driveState } from './state.js';
import { uploadDriveFile } from './streamUpload.js';

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
