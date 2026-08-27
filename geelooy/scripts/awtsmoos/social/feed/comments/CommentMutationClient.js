//B"H
//Boruch Hashem
//Blessed is He

import { commentMutationBody } from './CommentMutationBody.js';
import { currentCommentAlias, encodeCommentCoordinate } from './CommentIdentity.js';

/**
 * @class TiferesCommentMutationClient
 * @description
 * Tiferes attempts canonical server mutation first and invokes local Netzach fallback only when transport actually breaks.
 * The Awtsmoos renews online and degraded paths without confusing them; Awtsmoos.com keeps success canonical and failure visibly pending,
 * so one click creates one truth rather than both server and local shadows that later appear as accidental duplicate ending.
 */
export class TiferesCommentMutationClient {
	/**
	 * @description Composes mutation URLs/body creation with explicit transport and fallback dependencies.
	 * @param {object} params Dependencies.
	 * @param {NetzachCommentTransport} params.transport Canonical HTTP transport.
	 * @param {NetzachCommentFallbackStore} params.fallback Local store used only after failed transport.
	 * @returns {TiferesCommentMutationClient} Configured mutation client.
	 * @throws {never} Construction stores collaborators only.
	 */
	constructor({ transport, fallback }) {
		this.transport = transport;
		this.fallback = fallback;
	}

	/**
	 * @description Creates a root or verse comment through the canonical tree endpoint, falling back locally only on transport failure.
	 * @param {object} object Normalized feed object carrying IDs.
	 * @param {string} text User-authored comment text.
	 * @param {object} [options={}] Alias, verse, and subsection coordinates.
	 * @returns {Promise<object>} Server result, empty marker, or explicit degraded local result.
	 * @throws {never} Transport failure is translated into fallback result rather than escaping the viewer.
	 */
	async root(object, text, options = {}) {
		return this.create({
			object,
			text,
			options,
			url: this.rootUrl(object),
			fallbackMeta: {
				verseSection: options.verseSection ?? 'root',
				subsectionId: options.subsectionId || ''
			}
		});
	}

	/**
	 * @description Creates a reply against either a whole comment or a rich comment section, preserving verse scope.
	 * @param {object} object Normalized feed object carrying IDs.
	 * @param {string} parentId Canonical parent comment identifier.
	 * @param {string} text User-authored reply text.
	 * @param {object} [options={}] Alias, verse, and optional parent-section coordinates.
	 * @returns {Promise<object>} Server result, empty marker, or explicit degraded local result.
	 * @throws {never} Transport failure becomes local fallback state.
	 */
	async reply(object, parentId, text, options = {}) {
		const sectionId = options.sectionId || '';
		return this.create({
			object,
			text,
			options: { ...options, parentSectionId: sectionId },
			url: this.replyUrl(object, parentId, sectionId),
			fallbackMeta: {
				verseSection: options.verseSection ?? 'root',
				parentId,
				parentSectionId: sectionId
			}
		});
	}

	/** @description Executes one prepared comment mutation with shared empty/fallback semantics. @param {object} params Prepared mutation request. @returns {Promise<object>} Canonical or degraded result. @throws {never} Transport errors are contained. */
	async create({ object, text, options, url, fallbackMeta }) {
		const clean = String(text || '').trim();
		if (!clean) {
			return { success: false, empty: true };
		}
		const aliasId = options.aliasId || currentCommentAlias();
		const body = commentMutationBody({
			aliasId,
			text: clean,
			verseSection: options.verseSection ?? 'root',
			subsectionId: options.subsectionId || '',
			parentSectionId: options.parentSectionId || '',
			seriesId: object.seriesId || 'root'
		});
		try {
			return await this.transport.json(url, { method: 'POST', body });
		} catch (error) {
			const local = this.fallback.add(object.id, clean, { ...fallbackMeta, author: aliasId });
			return { success: Boolean(local), degraded: true, local, error: error.message };
		}
	}

	/** @description Builds the canonical root comment-tree route. @param {object} object Normalized feed object. @returns {string} Encoded route. @throws {never} Coordinates are string-encoded. */
	rootUrl(object) {
		return `/api/social/heichelos/${encodeCommentCoordinate(object.heichelId || 'ikar')}/posts/${encodeCommentCoordinate(object.postId || object.id)}/comment-tree`;
	}

	/** @description Builds the canonical whole-comment or rich-section reply route. @param {object} object Normalized feed object. @param {string} parentId Parent comment ID. @param {string} sectionId Optional rich section ID. @returns {string} Encoded reply route. @throws {never} Coordinates are string-encoded. */
	replyUrl(object, parentId, sectionId) {
		const base = `/api/social/heichelos/${encodeCommentCoordinate(object.heichelId || 'ikar')}/posts/${encodeCommentCoordinate(object.postId || object.id)}/comments/${encodeCommentCoordinate(parentId)}`;
		return sectionId ? `${base}/sections/${encodeCommentCoordinate(sectionId)}/replies` : `${base}/replies`;
	}
}
