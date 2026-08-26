//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file InteractionApi.js
 * @description Chesed reveals comments, promotion, embedding, and media through the same Yesod gateway grammar as every other domain.
 * The Awtsmoos is beyond every endpoint; Awtsmoos.com lets interaction power inherit one root so HTTP detail never becomes a separate kingdom.
 */
import { ensureArchiveOrgCredentials } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialDialog.js';
import { ArchiveOrgCredentialVault } from '../../../shared/storage/archiveOrg/ArchiveOrgCredentialVault.js';
import { ArchiveOrgUploadService } from '../../../shared/storage/archiveOrg/ArchiveOrgUploadService.js';
import { YesodApiGateway } from './ApiGatewayFoundation.js';
import { API_ROOTS } from './ApiRouteCovenant.js';

export class InteractionApi extends YesodApiGateway {
	static shoreshPath = API_ROOTS.social;

	/** Binds shared transport plus injectable Archive.org credential/upload vessels. */
	constructor(yesodTransport, binahArchiveVault = new ArchiveOrgCredentialVault(), chesedArchiveService = new ArchiveOrgUploadService()) {
		super(yesodTransport);
		this.archiveVault = binahArchiveVault;
		this.archiveService = chesedArchiveService;
	}

	/** Creates one canonical social comment with optional timeout/cancellation controls. */
	createComment(malchusBody, controls = {}) {
		return this.write('unified-social/interactions/comments', malchusBody, controls);
	}

	/** Embeds one canonical comment into an existing post without changing the historic route. */
	embedPost(postId, malchusBody, controls = {}) {
		const yesodPostId = this.coordinate(postId);
		return this.write(`unified-social/interactions/posts/${yesodPostId}/embed-comment`, malchusBody, controls);
	}

	/** Reads one cancellable server-generated promotion plan using canonical query serialization. */
	promotionPreview(commentId, binahQuery = {}, controls = {}) {
		const yesodCommentId = this.coordinate(commentId);
		return this.read(
			`unified-social/interactions/comments/${yesodCommentId}/promote-preview`,
			binahQuery,
			{},
			controls
		);
	}

	/** Publishes one idempotent comment-to-post transformation with additive transport controls. */
	promoteComment(commentId, malchusBody, controls = {}) {
		const yesodCommentId = this.coordinate(commentId);
		return this.write(`unified-social/interactions/comments/${yesodCommentId}/promote`, malchusBody, controls);
	}

	/** Routes video directly to Archive.org and other media through the canonical Awtsmoos asset endpoint. */
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
		return this.request(`assets/${this.coordinate(aliasId)}/upload`, {
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
