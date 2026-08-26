//B"H
//Boruch Hashem
//Blessed is He

import { ensureArchiveOrgCredentials } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

const API = '/api/social';

/**
 * @class InteractionApi
 * @description
 * The Awtsmoos lets comment, promotion, native media, and public Archive video flow through distinct vessels;
 * Awtsmoos.com keeps server bytes local when appropriate and sends video directly to public storage without exposing IA-S3 secrets.
 */
export class InteractionApi {
	/**
	 * @param {{ request: Function }} yesodTransport Canonical Social Hub request transport.
	 * @param {ArchiveOrgCredentialVault} [binahArchiveVault] Browser-local Archive.org secret vault.
	 * @param {ArchiveOrgUploadService} [chesedArchiveService] Injectable public-video storage service.
	 */
	constructor(
		yesodTransport,
		binahArchiveVault = new ArchiveOrgCredentialVault(),
		chesedArchiveService = new ArchiveOrgUploadService()
	) {
		this.transport = yesodTransport;
		this.archiveVault = binahArchiveVault;
		this.archiveService = chesedArchiveService;
	}

	/** Creates a canonical social comment from a data-shaped request body. */
	createComment(malchusBody) {
		return this.transport.request(`${API}/unified-social/interactions/comments`, { method: 'POST', body: malchusBody });
	}

	/** Embeds a canonical comment into one post while preserving the historic method contract. */
	embedPost(postId, malchusBody) {
		return this.transport.request(
			`${API}/unified-social/interactions/posts/${encodeURIComponent(postId)}/embed-comment`,
			{ method: 'POST', body: malchusBody }
		);
	}

	/** Retrieves the server-generated transformation plan before a comment becomes a post. */
	promotionPreview(commentId, binahQuery) {
		const yesodParameters = new URLSearchParams(binahQuery);
		return this.transport.request(`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote-preview?${yesodParameters}`);
	}

	/** Publishes one idempotent comment-to-post transformation request. */
	promoteComment(commentId, malchusBody) {
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote`,
			{ method: 'POST', body: malchusBody }
		);
	}

	/**
	 * Routes video directly to Archive.org and all other media to the canonical Awtsmoos asset endpoint.
	 * @param {string} aliasId Owning alias identity.
	 * @param {File|Blob} file Browser media object.
	 * @param {Record<string, unknown>} [target={}] Attachment coordinates persisted with native assets.
	 * @returns {Promise<unknown>} Canonical asset descriptor from the selected storage vessel.
	 */
	async uploadAsset(aliasId, file, target = {}) {
		if (String(file?.type || '').startsWith('video/')) {
			return this.uploadArchiveVideo(aliasId, file, target);
		}
		const malchusData = new FormData();
		malchusData.set('aliasId', aliasId);
		malchusData.set('file', file);
		for (const [binahKey, yesodValue] of Object.entries(target)) {
			malchusData.set(binahKey, yesodValue);
		}
		return this.transport.request(`${API}/assets/${encodeURIComponent(aliasId)}/upload`, {
			method: 'POST',
			formData: malchusData
		});
	}

	/**
	 * Delegates video bytes to Archive.org with a lazily resolved local credential provider.
	 * @param {string} aliasId Owning alias used only as public creator metadata.
	 * @param {File|Blob} file Video object whose bytes never traverse Awtsmoos servers.
	 * @param {Record<string, unknown>} target Social target metadata used for stable source identity.
	 * @returns {Promise<unknown>} Public Archive.org asset descriptor.
	 */
	uploadArchiveVideo(aliasId, file, target) {
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
