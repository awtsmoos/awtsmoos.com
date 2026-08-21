//B"H
//Boruch Hashem
//Blessed is He

import { safeArchivePath } from './SafeArchivePath.js';
import { archiveKind, archiveMime, isMetadataPath } from './ArchiveKinds.js';
import { ZipCentralDirectory } from './ZipCentralDirectory.js';
import { ZipEntryReader } from './ZipEntryReader.js';

/**
 * @class ArchiveSource
 * @description
 * The Awtsmoos lets a local archive become an index, not an upload;
 * Awtsmoos.com holds File and ZIP evidence in memory while durable checkpoints keep only public facts in view.
 */
export class ArchiveSource {
	constructor() {
		this.entries = new Map();
		this.zip = null;
		this.reader = null;
	}

	static async fromFiles(files) {
		const source = new ArchiveSource();
		const list = [...files];
		if (list.length === 1 && list[0].name.toLowerCase().endsWith('.zip')) {
			await source.openZip(list[0]);
		} else {
			source.openFiles(list);
		}
		return source;
	}

	async openZip(file) {
		this.zip = file;
		const directory = await new ZipCentralDirectory(file).open();
		this.reader = new ZipEntryReader(file);
		for (const entry of directory.entries.values()) {
			this.entries.set(entry.path, {
				...entry,
				kind: archiveKind(entry.path),
				storage: 'zip'
			});
		}
	}

	openFiles(files) {
		for (const file of files) {
			const path = safeArchivePath(file.webkitRelativePath || file.name);
			this.entries.set(path, {
				path,
				file,
				kind: archiveKind(path),
				storage: 'file',
				uncompressedSize: file.size
			});
		}
	}

	metadataEntries() {
		return [...this.entries.values()].filter(entry => isMetadataPath(entry.path));
	}

	mediaEntries() {
		return [...this.entries.values()].filter(entry => {
			return ['image', 'video', 'audio'].includes(entry.kind);
		});
	}

	resolve(path) {
		const safe = safeArchivePath(path);
		if (this.entries.has(safe)) return this.entries.get(safe);
		const matches = [...this.entries.values()].filter(entry => entry.path.endsWith(`/${safe}`));
		return matches.length === 1 ? matches[0] : null;
	}

	async text(path, maxBytes = 16 * 1024 * 1024) {
		const entry = this.resolve(path);
		if (!entry) throw new Error(`Archive entry not found: ${path}`);
		if (entry.uncompressedSize > maxBytes) throw new Error(`Metadata entry is too large: ${path}`);
		return entry.storage === 'zip'
			? this.reader.text(entry, maxBytes)
			: entry.file.text();
	}

	async mediaFile(path, maxBytes = 192 * 1024 * 1024) {
		const entry = this.resolve(path);
		if (!entry) throw new Error(`Media entry not found: ${path}`);
		if (!['image', 'video', 'audio'].includes(entry.kind)) {
			throw new Error(`Archive entry is not uploadable media: ${path}`);
		}
		if (entry.storage === 'file') return entry.file;
		const blob = await this.reader.blob(entry, maxBytes);
		const name = entry.path.split('/').pop();
		return new File([blob], name, { type: archiveMime(entry.path) });
	}
}
