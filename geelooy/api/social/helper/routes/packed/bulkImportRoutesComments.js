//B"H
//Blessed is He
//Boruch Hashem

/**
 * Bulk import comment IDs, payload validation, flattening and comment building (split from bulkImportRoutes.js).
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Comment IDs: the live convention is BH_<ts>_<hex>_commentBy_<aliasId>.
// Payloads that already carry an `id` keep it. Otherwise we derive a
// DETERMINISTIC id in the same shape from the item content, so retries and
// resume compute the identical id and the idempotent skip stays correct.
// ---------------------------------------------------------------------------
function deterministicCommentId(item, ctx) {
	const h = crypto.createHash('sha256');
	h.update(String(ctx.postId) + '\n');
	h.update(String(item.dayuh.verseSection) + '\n');
	h.update(String(item.dayuh.subsectionId) + '\n');
	h.update(String(item.content));
	const hex = h.digest('hex');
	// decimal-ish timestamp part derived from the hash (13 digits, like Date.now())
	const tsPart = String(BigInt('0x' + hex.slice(0, 12)) % 9000000000000n + 1000000000000n);
	return 'BH_' + tsPart + '_' + hex.slice(12, 28) + '_commentBy_' + ctx.aliasId;
}

function commentIdFor(item, ctx) {
	if (item.id && typeof item.id === 'string' && item.id.length > 0) return item.id;
	if (item.commentId && typeof item.commentId === 'string' && item.commentId.length > 0) return item.commentId;
	return deterministicCommentId(item, ctx);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
function validateCommentItem(item, idx) {
	if (!item || typeof item !== 'object') return 'item ' + idx + ': not an object';
	if (typeof item.content !== 'string' || item.content.length === 0) return 'item ' + idx + ': empty content';
	const d = item.dayuh;
	if (!d || typeof d !== 'object') return 'item ' + idx + ': missing dayuh';
	if (d.verseSection === undefined || d.verseSection === null || d.verseSection === '') return 'item ' + idx + ': missing dayuh.verseSection';
	if (d.subsectionId === undefined || d.subsectionId === null || d.subsectionId === '') return 'item ' + idx + ': missing dayuh.subsectionId';
	return null;
}

/**
 * Flattens the accepted payload shapes into a plain item array:
 *   { commentArray: [...] }            — prepared local payloads
 *   { items: [...] }                   — inline jobs
 *   { "0": [...], "1": [...] }         — section-keyed staged payloads
 *   [...]                              — bare array
 */
function flattenPayload(parsed) {
	if (Array.isArray(parsed)) return parsed;
	if (!parsed || typeof parsed !== 'object') return null;
	if (Array.isArray(parsed.commentArray)) return parsed.commentArray;
	if (Array.isArray(parsed.items)) return parsed.items;
	const out = [];
	for (const k of Object.keys(parsed)) {
		const v = parsed[k];
		if (Array.isArray(v)) for (const item of v) out.push(item);
	}
	return out;
}

function buildComment(item, ctx, now) {
	const commentId = String(commentIdFor(item, ctx));
	const verseSection = String(item.dayuh.verseSection);
	const subsectionId = String(item.dayuh.subsectionId);
	return {
		id: commentId, heichelId: ctx.heichelId, postId: ctx.postId, entityId: ctx.postId,
		seriesId: ctx.seriesId,
		parentId: '', parentSectionId: '', parentType: 'entity',
		aliasId: ctx.aliasId, author: ctx.aliasId, content: item.content,
		verseSection, subsectionId,
		dayuh: { ...item.dayuh, kind: 'translation' },
		importedFrom: 'bulk-import-api-perpost', importedAt: now, createdAt: now, updatedAt: now, deleted: false,
	};
}

module.exports = {
	deterministicCommentId,
	commentIdFor,
	validateCommentItem,
	flattenPayload,
	buildComment,
};
