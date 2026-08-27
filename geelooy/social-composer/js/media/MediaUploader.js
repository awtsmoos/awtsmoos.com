//B"H
//Boruch Hashem
//Blessed is He

import { ensureArchiveOrgCredentials } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';
import { API_PREFIX } from '../config.js';

/**
 * @class MediaUploader
 * @description
 * The Awtsmoos lets public Archive evidence answer before the creator is asked to reveal a local key;
 * Awtsmoos.com stores native image and audio, while video reuses fingerprinted public truth or uploads directly across the sea.
 */
export class MediaUploader {
	constructor(
		store,
		fetcher = globalThis.fetch.bind(globalThis),
		vault = new ArchiveOrgCredentialVault(),
		archiveService = new ArchiveOrgUploadService()
	) {
		this.store = store;
		this.fetcher = fetcher;
		this.vault = vault;
		this.archiveService = archiveService;
	}

	async upload(scope, attachment, identity) {
		if (!(attachment.file instanceof File)) {
			throw new Error('Choose the local file again before uploading.');
		}
		this.store.update(scope, attachment.id, { status: 'uploading', error: '' });
		try {
			const manifest = attachment.type === 'video'
				? await this.uploadVideo(attachment, identity)
				: await this.uploadNative(scope, attachment, identity);
			this.store.update(scope, attachment.id, {
				status: 'uploaded',
				manifest,
				publicPath: manifest.publicPath,
				type: manifest.type || attachment.type,
				mime: manifest.mime || attachment.mime
			});
			return manifest;
		} catch (error) {
			this.store.update(scope, attachment.id, {
				status: 'failed',
				error: error.message
			});
			throw error;
		}
	}

	async uploadVideo(attachment, identity) {
		return this.archiveService.uploadVideo({
			file: attachment.file,
			mime: attachment.mime,
			mediaPath: attachment.name,
			credentialsProvider: () => ensureArchiveOrgCredentials(this.vault),
			item: {
				provider: 'awtsmoos-composer',
				sourceId: `${attachment.name}:${attachment.size}`,
				title: attachment.caption || attachment.name,
				text: attachment.caption || '',
				sourceProfile: { name: identity.aliasId || '' }
			}
		});
	}

	async uploadNative(scope, attachment, identity) {
		if (!identity.aliasId) throw new Error('Choose an alias before uploading.');
		const form = new FormData();
		form.append('file', attachment.file, attachment.name);
		form.append('attachKind', scope.kind === 'root' ? 'post' : scope.kind);
		if (scope.sectionId) form.append('verseSection', scope.sectionId);
		if (scope.subsectionId) form.append('subsectionId', scope.subsectionId);
		const response = await this.fetcher(
			`${API_PREFIX}/assets/${encodeURIComponent(identity.aliasId)}/upload`,
			{ method: 'POST', body: form }
		);
		const result = await response.json();
		if (!response.ok || result.error) {
			throw new Error(result.error?.message || `Upload failed with ${response.status}.`);
		}
		return Array.isArray(result.success) ? result.success[0] : result.success;
	}

	async uploadAll(scope, attachments, identity) {
		const manifests = [];
		for (const attachment of attachments.filter(item => item.status !== 'uploaded')) {
			manifests.push(await this.upload(scope, attachment, identity));
		}
		return manifests;
	}
}
