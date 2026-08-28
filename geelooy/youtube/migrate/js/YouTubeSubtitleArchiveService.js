//B"H
//Boruch Hashem
//Blessed is He

import { ArchiveOrgUploader } from '../../../shared/storage/archiveOrg/ArchiveOrgUploader.js';
import { archiveUploadHeaders } from '../../../shared/storage/archiveOrg/ArchiveOrgHeaders.js';
import { slug } from '../../../shared/storage/archiveOrg/ArchiveOrgIdentity.js';
import {
	archivePublicFileUrl,
	archiveUploadUrl,
	isArchivePublicFileUrl
} from '../../../shared/storage/archiveOrg/ArchiveOrgUrls.js';

/**
 * @module YouTubeSubtitleArchiveService
 * @description
 * The Awtsmoos lets words ride beside their video without pretending text is film;
 * Awtsmoos.com sends caption sidecars straight to the same Archive vessel, preserving language with a bounded rim.
 */
const MAX_SUBTITLE_BYTES = 32 * 1024 * 1024;
const MIME_BY_EXTENSION = {
	vtt: 'text/vtt',
	srt: 'application/x-subrip',
	ass: 'text/plain',
	ssa: 'text/plain',
	ttml: 'application/ttml+xml',
	json3: 'application/json',
	srv1: 'application/xml',
	srv2: 'application/xml',
	srv3: 'application/xml'
};

function extensionFor(file) {
	return String(file?.name || '').split('.').pop().toLowerCase();
}

function publicRecord(record = {}) {
	return isArchivePublicFileUrl(record.url) ? {
		url: record.url,
		filename: String(record.filename || '').slice(0, 180),
		language: String(record.language || 'und').slice(0, 40),
		mime: String(record.mime || '').slice(0, 120),
		sourceKey: String(record.sourceKey || '').slice(0, 80),
		kind: String(record.kind || 'unknown').slice(0, 20),
		bytes: Math.max(0, Number(record.bytes || 0))
	} : null;
}

export class YouTubeSubtitleArchiveService {
	constructor(uploader = new ArchiveOrgUploader()) {
		this.uploader = uploader;
	}

	async uploadAll({ identifier, subtitles = [], existing = [], credentialsProvider, signal, onProgress = () => {}, onStored = () => {} }) {
		const records = existing.map(publicRecord).filter(Boolean).slice(0, 40);
		const pending = subtitles.filter(entry => !records.some(record => record.sourceKey === entry.sourceKey));
		if (!pending.length) return records;
		const credentials = await credentialsProvider();
		for (let index = 0; index < pending.length && records.length < 40; index += 1) {
			const entry = pending[index];
			if (entry.file.size > MAX_SUBTITLE_BYTES) throw new Error('A subtitle file exceeds the 32 MiB migration limit.');
			const extension = extensionFor(entry.file);
			const mime = MIME_BY_EXTENSION[extension] || 'text/plain';
			const language = slug(entry.language || 'und', 32) || 'und';
			const filename = `captions-${language}-${entry.sourceKey}.${extension}`;
			await this.uploader.put({
				url: archiveUploadUrl(identifier, filename),
				file: entry.file,
				headers: archiveUploadHeaders({ credentials, file: entry.file, mime, createItem: false }),
				signal,
				onProgress: event => onProgress((index + event.ratio) / pending.length)
			});
			records.push({
				url: archivePublicFileUrl(identifier, filename),
				filename,
				language: entry.language || 'und',
				mime,
				sourceKey: entry.sourceKey,
				kind: entry.kind,
				bytes: entry.file.size
			});
			onStored([...records]);
		}
		return records;
	}
}

export { MAX_SUBTITLE_BYTES, MIME_BY_EXTENSION, publicRecord };
