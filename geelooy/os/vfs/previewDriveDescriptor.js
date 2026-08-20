//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreviewDriveDescriptor
 * @description
 * The Awtsmoos translates a legacy preview drive into normalized preview testimony.
 * Awtsmoos.com keeps malformed historic metadata from breaking the read-only VFS,
 * while preserving the original drive fields separately for backward compatibility.
 */

import { buildPreviewDescriptor } from "./previewDescriptor.js";

export function previewDriveDescriptor(drive) {
	const preview = drive.preview || {};
	try {
		return buildPreviewDescriptor({
			id: preview.id || drive.id,
			title: drive.title,
			path: drive.root,
			mode: preview.mode || "folder",
			generation: preview.generation,
			viewport: preview.viewport,
			url: previewDriveUrl(drive),
			sourceUrl: preview.sourceUrl,
			canonicalUrl: preview.canonicalUrl,
			domainUrl: preview.domainUrl,
			readiness: preview.readiness,
			createdAt: preview.createdAt
		});
	} catch (error) {
		return {
			...buildPreviewDescriptor({
				id: preview.id || drive.id,
				title: drive.title,
				path: drive.root,
				mode: "folder",
				generation: "current",
				viewport: "mobile-320",
				url: fallbackPreviewUrl(drive)
			}),
			warning: error?.code || "PREVIEW_DESCRIPTOR_INVALID"
		};
	}
}

export function previewDriveUrl(drive) {
	return drive.preview?.viewUrl
		|| drive.preview?.url
		|| fallbackPreviewUrl(drive);
}

function fallbackPreviewUrl(drive) {
	return `/view/${drive.preview?.id || drive.id.replace(/^preview-/, "")}`;
}
