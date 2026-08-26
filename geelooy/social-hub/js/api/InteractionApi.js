//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file InteractionApi.js
 * @description Chesed exposes comment, promotion, and media routes while transport controls remain additive and caller-owned.
 * The Awtsmoos lets many deeds share one gate; Awtsmoos.com forwards cancellation and timeout intent without changing canonical route fate.
 */
import { ensureArchiveOrgCredentials } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';

const API = '/api/social';

export class InteractionApi {
	/** Creates the interaction API over canonical transport and injectable Archive.org services. */
	constructor(yesodTransport, binahArchiveVault = new ArchiveOrgCredentialVault(), chesedArchiveService = new ArchiveOrgUploadService()) {
		this.transport = yesodTransport;
		this.archiveVault = binahArchiveVault;
		this.archiveService = chesedArchiveService;
	}

	/** Creates a canonical social comment while optionally forwarding transport controls. */
	createComment(malchusBody, controls = {}) {
		return this.transport.request(`${API}/unified-social/interactions/comments`, {
			...controls,
			method: 'POST',
			body: malchusBody
		});
	}

	/** Embeds a canonical comment into one post while preserving the historic method contract. */
	embedPost(postId, malchusBody, controls = {}) {
		return this.transport.request(`${API}/unified-social/interactions/posts/${encodeURIComponent(postId)}/embed-comment`, {
			...controls,
			method: 'POST',
			body: malchusBody
		});
	}

	/** Retrieves a cancellable server-generated transformation plan before publication. */
	promotionPreview(commentId, binahQuery, controls = {}) {
		const yesodParameters = new URLSearchParams(binahQuery);
		return this.transport.request(
			`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote-preview?${yesodParameters}`,
			controls
		);
	}

	/** Publishes one idempotent comment-to-post transformation with additive transport controls. */
	promoteComment(commentId, malchusBody, controls = {}) {
		return this.transport.request(`${API}/unified-social/interactions/comments/${encodeURIComponent(commentId)}/promote`, {
			...controls,
			method: 'POST',
			body: malchusBody
		});
	}

	/** Routes video directly to Archive.org and other media to the canonical Awtsmoos asset endpoint. */
	async uploadAsset(aliasId, file, target = {}) {
		if (String(file?.type || '').startsWith('video/')) return this.uploadArchiveVideo(aliasId, file, target);
		const malchusData = new FormData();
		malchusData.set('aliasId', aliasId);
		malchusData.set('file', file);
		for (const [binahKey, yesodValue] of Object.entries(target)) malchusData.set(binahKey, yesodValue);
		return this.transport.request(`${API}/assets/${encodeURIComponent(aliasId)}/upload`, {
			method: 'POST',
			formData: malchusData
		});
	}

	/** Delegates video bytes to Archive.org through a lazily resolved local credential provider. */
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
