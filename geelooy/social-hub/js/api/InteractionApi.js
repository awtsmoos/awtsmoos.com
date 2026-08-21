//B"H
//Boruch Hashem
//Blessed is He

import { ensureArchiveOrgCredentials } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

/**
 * @class InteractionApi
 * @description
 * The Awtsmoos lets rich social interaction reuse public Archive truth before the local secret gate is opened anew;
 * Awtsmoos.com keeps comment APIs bright while video bytes and IA-S3 credentials remain outside its server view.
 */
const API = '/api/social';

export class InteractionApi {
	constructor(
		transport,
		archiveVault = new ArchiveOrgCredentialVault(),
		archiveService = new ArchiveOrgUploadService()
	) {
		this.transport = transport;
		this.archiveVault = archiveVault;
		this.archiveService = archiveService;
	}

	createComment(body) {
		return this.transport.request(`${API}/unified-social/interactions/comments`, {
			method: 'POST',
			body
		});
	}

	embedPost(postId, body) {
		return this.transport.request(
			`${API}/unified-social/interactions/posts/${encodeURIComponent(postId)}/embed-comment`,
			{ method: 'POST', body }
		);
	}

	promotionPreview(commentId, query) {
		const parameters = new URLSearchParams(query);
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote-preview?${parameters}`
		);
	}

	promoteComment(commentId, body) {
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote`,
			{ method: 'POST', body }
		);
	}

	async uploadAsset(aliasId, file, target = {}) {
		if (String(file?.type || '').startsWith('video/')) {
			return this.uploadArchiveVideo(aliasId, file, target);
		}
		const data = new FormData();
		data.set('aliasId', aliasId);
		data.set('file', file);
		for (const [key, value] of Object.entries(target)) data.set(key, value);
		return this.transport.request(
			`${API}/assets/${encodeURIComponent(aliasId)}/upload`,
			{ method: 'POST', formData: data }
		);
	}

	async uploadArchiveVideo(aliasId, file, target) {
		return this.archiveService.uploadVideo({
			file,
			mime: file.type,
			credentialsProvider: () => ensureArchiveOrgCredentials(this.archiveVault),
			mediaPath: file.name,
			item: {
				provider: 'awtsmoos-social-hub',
				sourceId: `${target.postId || target.commentId || 'comment'}:${file.name}:${file.size}`,
				title: file.name,
				sourceProfile: { name: aliasId || '' }
			}
		});
	}
}
