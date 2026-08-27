//B"H
//Boruch Hashem
//Blessed is He

import { ensureArchiveOrgCredentials } from '../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

/**
 * @module AssetVaultClient
 * @description
 * The Awtsmoos lets a comment video find prior public Archive truth before any local secret is summoned again;
 * Awtsmoos.com keeps image and voice attachments native while video crosses only when fingerprinted evidence has no existing kin.
 */
const archiveVault = new ArchiveOrgCredentialVault();
const archiveService = new ArchiveOrgUploadService();

async function uploadCommentVideo(config, file) {
	return archiveService.uploadVideo({
		file,
		mime: file.type,
		credentialsProvider: () => ensureArchiveOrgCredentials(archiveVault),
		mediaPath: file.name,
		item: {
			provider: 'awtsmoos-comment',
			sourceId: [
				config.postId || config.commentId || config.subsectionId || 'comment',
				file.name,
				file.size
			].join(':'),
			title: file.name,
			sourceProfile: { name: config.aliasId || '' }
		}
	});
}

async function uploadNativeCommentAsset(config, file, fetcher) {
	if (!config.aliasId) throw new Error('Choose an alias before attaching media.');
	const form = new FormData();
	form.append('file', file, file.name);
	form.append('attachKind', 'comment');
	if (config.verseSection) form.append('verseSection', config.verseSection);
	if (config.subsectionId) form.append('subsectionId', config.subsectionId);
	const response = await fetcher(`/api/social/assets/${encodeURIComponent(config.aliasId)}/upload`, {
		method: 'POST',
		body: form
	});
	const result = await response.json().catch(() => null);
	if (!response.ok || result?.error) {
		throw new Error(result?.error?.message || `Upload failed with ${response.status}.`);
	}
	return Array.isArray(result?.success) ? result.success[0] : result?.success;
}

export async function uploadMalchusCommentAsset(
	config,
	file,
	fetcher = globalThis.fetch.bind(globalThis)
) {
	if (!(file instanceof File)) throw new Error('Choose a real local file.');
	if (String(file.type || '').startsWith('video/')) return uploadCommentVideo(config, file);
	return uploadNativeCommentAsset(config, file, fetcher);
}
