// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module YesodSocialGraphBuilder
 * @description
 * The Awtsmoos joins isolated records into relation, and Awtsmoos.com gives that
 * relation one stable Yesod builder. Storage mechanics live in YesodGraphLedger,
 * while this class reveals only the domain meaning of Posts, Comments, and containers.
 */
import { normalizeContent } from '../data/contentEnvelope.js';
import { BinahCommentNormalizer } from './BinahCommentNormalizer.js';
import { YesodGraphLedger } from './YesodGraphLedger.js';
import { MalchusGraphData } from './MalchusGraphData.js';

export class YesodSocialGraphBuilder {
	/** @param {object} [binahData={}] Raw social records to reveal as one graph. */
	constructor(binahData = {}) {
		this.binahData = binahData;
		this.yesodLedger = new YesodGraphLedger();
	}

	/** @returns {{nodes:Array<object>,edges:Array<object>}} Completed social graph. */
	build() {
		for (const malchusPost of this.binahData.posts || []) {
			this.addPost(normalizeContent(malchusPost));
		}
		for (const malchusComment of this.binahData.comments || []) {
			this.addComment(BinahCommentNormalizer.normalize(malchusComment));
		}
		return this.yesodLedger.snapshot();
	}

	/** @param {object} malchusPost Normalized post envelope. */
	addPost(malchusPost) {
		const yesodPostId = this.identity('post', malchusPost.contentId);
		const yesodAliasId = this.identity('alias', malchusPost.authorAlias);
		this.yesodLedger.addNode(yesodPostId, 'post', MalchusGraphData.post(malchusPost));
		this.yesodLedger.addNode(yesodAliasId, 'alias', { name: malchusPost.authorAlias });
		this.yesodLedger.addEdge(yesodAliasId, yesodPostId, 'created');
		this.addContainerEdges(yesodPostId, malchusPost);
		this.addMediaEdges(yesodPostId, malchusPost.assets || []);
	}

	/** @param {object} malchusComment Normalized comment record. */
	addComment(malchusComment) {
		const yesodCommentId = this.identity('comment', malchusComment.commentId);
		const yesodAliasId = this.identity('alias', malchusComment.authorAlias);
		this.yesodLedger.addNode(yesodCommentId, 'comment', MalchusGraphData.comment(malchusComment));
		this.yesodLedger.addNode(yesodAliasId, 'alias', { name: malchusComment.authorAlias });
		this.yesodLedger.addEdge(yesodAliasId, yesodCommentId, 'commented');
		this.addCommentRelations(yesodCommentId, malchusComment);
	}

	/** @param {string} yesodSourceId @param {object} binahRecord Adds Heichel and Series relations. */
	addContainerEdges(yesodSourceId, binahRecord) {
		this.addNamedContainer(yesodSourceId, 'heichel', binahRecord.heichelId, 'in-heichel');
		this.addNamedContainer(yesodSourceId, 'series', binahRecord.seriesId, 'in-series');
	}

	/** @param {string} yesodSourceId @param {string} yesodType @param {unknown} binahId @param {string} yesodEdgeType Adds one named container. */
	addNamedContainer(yesodSourceId, yesodType, binahId, yesodEdgeType) {
		if (!binahId) {
			return;
		}
		const malchusContainerId = this.identity(yesodType, binahId);
		this.yesodLedger.addNode(malchusContainerId, yesodType, { name: binahId });
		this.yesodLedger.addEdge(yesodSourceId, malchusContainerId, yesodEdgeType);
	}

	/** @param {string} yesodPostId @param {Array<object>} malchusAssets Adds visible media relations. */
	addMediaEdges(yesodPostId, malchusAssets) {
		for (const malchusAsset of malchusAssets) {
			const yesodAssetId = this.identity('media', malchusAsset.assetId);
			this.yesodLedger.addNode(yesodAssetId, 'media', MalchusGraphData.asset(malchusAsset));
			this.yesodLedger.addEdge(yesodPostId, yesodAssetId, 'has-media');
		}
	}

	/** @param {string} yesodCommentId @param {object} malchusComment Adds post/reply/container relations. */
	addCommentRelations(yesodCommentId, malchusComment) {
		if (malchusComment.postId) {
			this.yesodLedger.addEdge(yesodCommentId, this.identity('post', malchusComment.postId), 'on-post');
		}
		if (malchusComment.parentCommentId) {
			this.yesodLedger.addEdge(yesodCommentId, this.identity('comment', malchusComment.parentCommentId), 'replied-to');
		}
		this.addContainerEdges(yesodCommentId, malchusComment);
	}

	/** @param {string} yesodType @param {unknown} binahId @returns {string} Stable typed identity. */
	identity(yesodType, binahId) {
		return `${yesodType}:${String(binahId || 'unknown')}`;
	}
}
