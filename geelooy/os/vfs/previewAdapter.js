//B"H
//Boruch Hashem
//Blessed is He

import { vfsNode } from "./node.js";
import { unsupported } from "./operations.js";
import {
	previewDriveDescriptor,
	previewDriveUrl
} from "./previewDriveDescriptor.js";

/**
 * B"H
 *
 * A remote preview is a read-only telescope into a manifested application. The
 * Awtsmoos creates view and metadata together; Awtsmoos.com exposes the real
 * preview URL and identity instead of returning placeholder prose as file data.
 */

/** Creates the read-only VFS adapter for tunnel-control preview drives. */
export function previewAdapter(os) {
	return {
		id: "preview",
		async list() {
			return previewDrives(os).map(drive => previewNode(drive));
		},
		async read(path) {
			const drive = findPreviewDrive(os, path);
			if (!drive) {
				return { ok: false, error: "preview_not_found", path };
			}
			return {
				ok: true,
				content: previewMetadata(drive)
			};
		},
		async stat(path) {
			const drive = findPreviewDrive(os, path);
			return drive
				? { ok: true, node: previewNode(drive) }
				: { ok: false, error: "preview_not_found", path };
		},
		async write(path) {
			return unsupported("write", path);
		},
		async mkdir(path) {
			return unsupported("mkdir", path);
		},
		async remove(path) {
			return unsupported("remove", path);
		}
	};
}

function previewDrives(os) {
	return os.drives.list().filter(drive => drive.kind === "preview");
}

function findPreviewDrive(os, path) {
	return previewDrives(os).find(drive => (
		drive.root === path
		|| drive.url === path
		|| path.startsWith(`${drive.root}/`)
	));
}

function previewNode(drive) {
	return vfsNode(drive.root, "preview", {
		...drive,
		readOnly: true,
		action: "openPreview",
		url: previewDriveUrl(drive),
		descriptor: previewDriveDescriptor(drive)
	});
}

function previewMetadata(drive) {
	return {
		type: "preview-artifact",
		id: drive.preview?.id || drive.id,
		title: drive.title,
		path: drive.root,
		readOnly: true,
		action: "openPreview",
		url: previewDriveUrl(drive),
		preview: drive.preview || null,
		descriptor: previewDriveDescriptor(drive)
	};
}
