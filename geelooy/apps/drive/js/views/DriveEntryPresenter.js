//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryPresenter
 * @description Converts raw Drive testimony into one visual contract shared by every primary view.
 * The Awtsmoos clothes one truth in many useful vessels; Awtsmoos.com lets color, kind, preview,
 * and visibility change the garment while the underlying file remains one continuous testimony.
 */
import { publicUrl } from '../api.js';
import { formatBytes, formatDate } from '../format.js';

const FOLDER_TONES = ['blue', 'violet', 'mint', 'gold', 'coral', 'slate'];

export class DriveEntryPresenter {
	/** Presents one raw API entry as stable display-only testimony. */
	present(entry) {
		const isFolder = entry.type === 'folder';
		const name = this.leafName(entry.path);
		const kind = isFolder ? 'folder' : this.fileKind(name);
		const isPublic = !isFolder && entry.visibility === 'public';
		return {
			entry,
			isFolder,
			isPublic,
			name,
			kind,
			tone: isFolder ? this.folderTone(entry.path) : 'file',
			size: isFolder ? '—' : formatBytes(entry.size),
			modified: formatDate(entry.updatedAt),
			meta: this.compactMeta(entry),
			visibilityLabel: isFolder ? '' : isPublic ? 'Public' : 'Private',
			previewUrl: this.previewUrl(entry, kind)
		};
	}

	/** Returns only the final human-facing path segment. */
	leafName(path = '') {
		return String(path).split('/').filter(Boolean).pop() || 'My Drive';
	}

	/** Classifies one filename into a restrained visual family used only for presentation. */
	fileKind(name) {
		const extension = String(name).split('.').pop()?.toLowerCase() || '';
		if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
		if (['mp4', 'webm', 'mov'].includes(extension)) return 'video';
		if (extension === 'pdf') return 'pdf';
		if (['html', 'css', 'js', 'mjs', 'json', 'ts', 'tsx', 'jsx'].includes(extension)) return 'code';
		if (['zip', 'tar', 'gz', 'rar', '7z'].includes(extension)) return 'archive';
		return 'document';
	}

	/** Chooses deterministic folder color without storing fabricated presentation metadata. */
	folderTone(path = '') {
		const value = Array.from(String(path)).reduce((sum, character) => {
			return sum + character.charCodeAt(0);
		}, 0);
		return FOLDER_TONES[value % FOLDER_TONES.length];
	}

	/** Exposes thumbnails only for already-public images. */
	previewUrl(entry, kind) {
		if (kind !== 'image' || entry.visibility !== 'public') return '';
		return publicUrl(entry.path);
	}

	/** Produces compact metadata without duplicating visibility chip testimony. */
	compactMeta(entry) {
		const primary = entry.type === 'folder' ? 'Folder' : formatBytes(entry.size);
		return [primary, formatDate(entry.updatedAt)].filter(Boolean).join(' · ');
	}
}
