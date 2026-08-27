// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentMutation
 * @description Dedicated native comment creation and authenticated updates.
 */
const { er } = require('../general.js');
const { verifyAliasOwnership } = require('../alias.js');
const { normalizeCommentBody, uniqueCommentUrl } = require('./richCommentSchema.js');
const { indexAliasComment } = require('./aliasCommentIndex.js');
const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

function id(aliasId) {
	return `c_${Date.now()}_${aliasId}_${Math.random().toString(36).slice(2)}`;
}

function legacyDayuh(body = {}) {
	if (body.legacyDayuh && typeof body.legacyDayuh === 'object') return body.legacyDayuh;
	if (body.dayuh && typeof body.dayuh === 'object') return body.dayuh;
	if (typeof body.dayuh === 'string') {
		try { return JSON.parse(body.dayuh) || null; } catch {}
	}
	return null;
}

function hasBody(body, legacy) {
	return body.content || body.audioNoteText || body.assets.length || body.links.length || body.sections.length || legacy;
}

async function ensureOwner({ $i, aliasId, userid }) {
	$i.$_GET = $i.$_GET || {};
	$i.$_POST = $i.$_POST || {};
	$i.request = $i.request || { headers: {} };
	const ok = await verifyAliasOwnership(aliasId, $i, userid);
	return ok ? null : er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required for comment action.' });
}

async function createComment({ $i, userid, heichelId, postId, seriesId = 'root', parentId = '', parentSectionId = '', aliasId }) {
	aliasId = aliasId || $i.$_POST?.aliasId;
	parentSectionId = parentSectionId || $i.$_POST?.parentSectionId || $i.$_POST?.replyToSectionId || '';
	const blocked = await ensureOwner({ $i, aliasId, userid });
	if (blocked) return blocked;
	const source = $i.$_POST || {};
	const body = normalizeCommentBody(source);
	const legacy = legacyDayuh(source);
	if (!hasBody(body, legacy)) {
		return er({ code: 'EMPTY_COMMENT', message: 'Text, audio note, asset, link, section, or legacy metadata is required.' });
	}
	const commentId = id(aliasId);
	const comment = {
		id: commentId,
		heichelId,
		postId,
		entityId: postId,
		seriesId,
		parentId,
		parentSectionId,
		parentType: parentId ? (parentSectionId ? 'commentSection' : 'comment') : 'entity',
		aliasId,
		author: aliasId,
		...body,
		dayuh: legacy,
		legacyDayuh: legacy,
		url: '',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		deleted: false
	};
	comment.url = uniqueCommentUrl(comment);
	const context = access.context(heichelId, postId, { commentId, verseSection: comment.verseSection, subsectionId: comment.subsectionId });
	access.write($i, paths.commentPath(context), comment);
	access.write($i, paths.uniquePath({ commentId }), { heichelId, postId, seriesId });
	await indexAliasComment({ $i, comment });
	access.writeIndex($i, parentId ? paths.childIndexPath(access.context(heichelId, postId, { commentId: parentId })) : paths.rootChildrenPath(context), commentId);
	access.writeIndex($i, paths.verseIndexPath(context), commentId);
	if (comment.subsectionId) access.writeIndex($i, paths.subsectionIndexPath(context), commentId);
	return { success: comment };
}

async function updateComment({ $i, userid, heichelId, postId, commentId, aliasId }) {
	aliasId = aliasId || $i.$_PUT?.aliasId || $i.$_POST?.aliasId;
	const blocked = await ensureOwner({ $i, aliasId, userid });
	if (blocked) return blocked;
	const got = access.getComment({ $i, heichelId, postId, commentId });
	if (!got.success) return got;
	if (String(got.success.aliasId || got.success.author) !== String(aliasId)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Comment author mismatch.' });
	}
	const source = $i.$_PUT || $i.$_POST || {};
	const normalized = normalizeCommentBody(source);
	const next = { ...got.success, updatedAt: Date.now() };
	if ('content' in source || 'text' in source) next.content = normalized.content;
	if ('assets' in source || 'attachments' in source) next.assets = normalized.assets;
	if ('sections' in source || 'commentSections' in source) next.sections = normalized.sections;
	if ('links' in source) {
		next.links = normalized.links;
		next.previews = normalized.previews;
	}
	const legacy = legacyDayuh(source);
	if (legacy) {
		next.dayuh = legacy;
		next.legacyDayuh = legacy;
	}
	access.write($i, paths.commentPath(access.context(heichelId, postId, { commentId })), next);
	await indexAliasComment({ $i, comment: next });
	return { success: next };
}

module.exports = { createComment, updateComment };
