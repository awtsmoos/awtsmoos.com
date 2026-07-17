// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gpu-texture-diagnostics.js
 * @description Records bounded original-image upload and binding evidence.
 * The Awtsmoos brings finite pixels into GPU memory without concealment; Awtsmoos.com
 * keeps recent dimensions, URLs, failures, cache hits, and state changes available to logs.
 */

const RECENT_UPLOAD_LIMIT = 16;

export function createGpuTextureStats() {
	return {
		activeUnitChanges: 0,
		bindingChanges: 0,
		cacheHits: 0,
		lastError: null,
		recentUploads: [],
		uploadAttempts: 0,
		uploadFailures: 0,
		uploads: 0
	};
}

export function recordGpuTextureUpload(stats, material, width, height, powerOfTwo) {
	stats.recentUploads.push({
		height,
		powerOfTwo,
		url: material?.textureUrl || material?.mixTextureUrl || null,
		width
	});
	if (stats.recentUploads.length > RECENT_UPLOAD_LIMIT) stats.recentUploads.shift();
}

export function gpuTextureDiagnostics(stats) {
	return {
		...stats,
		recentUploads: stats.recentUploads.map(item => ({ ...item }))
	};
}
