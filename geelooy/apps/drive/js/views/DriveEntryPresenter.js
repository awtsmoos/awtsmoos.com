//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryPresenter
 * @description Converts raw Drive testimony into one visual contract shared by
 * Home, Grid, List, Details, and upload reconciliation. The Awtsmoos clothes one
 * truth in many useful vessels; Awtsmoos.com never duplicates the underlying file.
 */
import { publicUrl } from '../api.js';
import { formatBytes, formatDate } from '../format.js';

const FOLDER_TONES = ['blue', 'violet', 'mint', 'gold', 'coral', 'slate'];

/** Presents one entry through stable, display-only testimony. */
export class DriveEntryPresenter {
	/** @param {object} entry Raw Drive entry returned by the API. */
	present(entry) {
		const isFolder = entry.type === 'folder';
		const name = this.leafName(entry.path);
		const kind = isFolder ? 'folder' : this.fileKind(name);
		return {
			entry,
			isFolder,
			name,
			kind,
			tone: isFolder ? this.folderTone(entry.path) : 'file',
			size: isFolder ? '—' : formatBytes(entry.size),
			modified: formatDate(entry.updatedAt),
			meta: this.mobileMeta(entry),
			isPublic: entry.visibility === 'public',
			previewUrl: this.previewUrl(entry, kind)
		};
	}

	/** Returns only the final human-facing path segment. */
	leafName(path = '') {
		return String(path).split('/').filter(Boolean).pop() || 'My Drive';
	}

	/** Classifies one filename into a restrained visual file family. */
	fileKind(name) {
		const extension = String(name).split('.').pop()?.toLowerCase() || '';
		if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
		if (extension === 'pdf') return 'pdf';
		if (['html', 'css', 'js', 'mjs', 'json', 'ts', 'tsx', 'jsx'].includes(extension)) return 'code';
		if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';
		if (['zip', 'tar', 'gz', 'rar', '7z'].includes(extension)) return 'archive';
		return 'document';
	}

	/** Chooses deterministic folder color without storing presentation metadata. */
	folderTone(path = '') {
		const value = Array.from(String(path)).reduce((sum, character) => sum + character.charCodeAt(0), 0);
		return FOLDER_TONES[value % FOLDER_TONES.length];
	}

	/** Exposes thumbnails only for already-public images. */
	previewUrl(entry, kind) {
		return kind === 'image' && entry.visibility === 'public' ? publicUrl(entry.path) : '';
	}

	/** Produces compact metadata shared by cards and phone rows. */
	mobileMeta(entry) {
		const primary = entry.type === 'folder' ? 'Folder' : formatBytes(entry.size);
		return [primary, entry.visibility, formatDate(entry.updatedAt)].filter(Boolean).join(' · ');
	}
}
