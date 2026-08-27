//B"H
//Boruch Hashem
//Blessed is He

import { ensureArchiveOrgCredentials } from '../../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

/**
 * @module AssetUploader
 * @description
 * The Awtsmoos lets public Archive receipts answer before an old social surface asks for a private local key;
 * Awtsmoos.com keeps image and voice assets native, while creator video reuses proof or sails directly across the sea.
 */
const archiveVault = new ArchiveOrgCredentialVault();
const archiveService = new ArchiveOrgUploadService();

function readAsBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(reader.error || new Error('Could not read file'));
		reader.onload = () => resolve(String(reader.result || '').split(',').pop() || '');
		reader.readAsDataURL(file);
	});
}

function uploadUrl(aliasId) {
	return `/api/social/assets/${encodeURIComponent(aliasId)}/upload`;
}

async function uploadArchiveVideo(options) {
	const { file } = options;
	return archiveService.uploadVideo({
		file,
		mime: file.type,
		credentialsProvider: () => ensureArchiveOrgCredentials(archiveVault),
		mediaPath: file.name,
		item: {
			provider: 'awtsmoos-social',
			sourceId: [
				options.attachKind || 'post',
				options.postId || '',
				options.commentId || '',
				file.name,
				file.size
			].join(':'),
			title: file.name,
			sourceProfile: { name: options.aliasId || '' }
		}
	});
}

async function uploadNativeAsset(options) {
	const { aliasId, file } = options;
	if (!aliasId) throw new Error('aliasId required before upload');
	const body = new URLSearchParams({
		fileBase64: await readAsBase64(file),
		filename: file.name || 'upload.bin',
		mime: file.type || 'application/octet-stream',
		attachKind: options.attachKind || 'post',
		postId: options.postId || '',
		verseId: options.verseId || '',
		subsectionId: options.subsectionId || '',
		commentId: options.commentId || ''
	});
	const response = await fetch(uploadUrl(aliasId), {
		method: 'POST',
		credentials: 'include',
		headers: { 'content-type': 'application/x-www-form-urlencoded' },
		body: body.toString()
	});
	const text = await response.text();
	const json = text ? JSON.parse(text) : {};
	if (!response.ok || json.error) throw new Error(json.error?.message || text || 'Upload failed');
	return json.success?.[0] || json.success;
}

export async function uploadAssetFile(options = {}) {
	if (!(options.file instanceof File)) throw new Error('file required before upload');
	if (String(options.file.type || '').startsWith('video/')) return uploadArchiveVideo(options);
	return uploadNativeAsset(options);
}

export async function pickAndUploadAssets(options = {}) {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = options.multiple !== false;
	input.accept = options.accept || 'image/*,audio/*,video/*';
	input.hidden = true;
	document.body.appendChild(input);
	const files = await new Promise(resolve => {
		input.addEventListener('change', () => resolve([...input.files]), { once: true });
		input.click();
	});
	input.remove();
	const uploaded = [];
	for (const file of files) uploaded.push(await uploadAssetFile({ ...options, file }));
	return uploaded;
}
