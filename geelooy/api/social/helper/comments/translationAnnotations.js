// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationAnnotations
 * @description Multiple translations per phrase, modeled as a DISTINCT
 * annotation type (worker G, 2026-10-21) — not discussion comments: no
 * replies, no threads, never listed in comment trees. Records live in the
 * comments PackedStore family under their own root:
 *   /social/heichelos/<h>/posts/<postId>/translationAnnotations/records/<id>
 *   .../translationAnnotations/all                  -> [ids]
 *   .../translationAnnotations/byPhrase/<sec>/<phrase> -> [ids]
 *   .../translationAnnotations/byUnit/<unit>/<phrase>  -> [ids]
 * The post's built-in phraseTranslations remain the primary layer and are
 * NEVER mutated here. Author attribution comes from the AUTH identity
 * (session or OAuth bearer); the alias a caller writes as must be owned by
 * that identity (same rule as comment creation).
 */
const { er } = require('../general.js');
const access = require('./richCommentAccess.js');
const { verifyAliasOwnership } = require('../alias.js');
const { readSourcePost, isPlatformOperator } = require('./postRefComment.js');

function root(heichelId, postId) {
	return `/social/heichelos/${heichelId}/posts/${postId}/translationAnnotations`;
}
function recordPath(heichelId, postId, id) { return `${root(heichelId, postId)}/records/${id}`; }
function allPath(heichelId, postId) { return `${root(heichelId, postId)}/all`; }
function phrasePath(heichelId, postId, sectionId, phraseId) {
	return `${root(heichelId, postId)}/byPhrase/${encodeURIComponent(sectionId || 'root')}/${encodeURIComponent(phraseId || 'root')}`;
}
function unitPath(heichelId, postId, unitIndex, phraseIndex) {
	return `${root(heichelId, postId)}/byUnit/${unitIndex}/${phraseIndex}`;
}

/** Auth identity: web session userid first, platform OAuth bearer second. */
function resolveUserId($i, userid) {
	if (userid) return String(userid);
	try {
		const { readBearer } = require('../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (resolved?.ok && resolved.entry?.userId) return String(resolved.entry.userId);
	} catch { /* no bearer */ }
	return null;
}

function freshId(aliasId) {
	return `ta_${Date.now()}_${aliasId}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Resolves an anchor against the live post's built-in phrase layer.
 * Returns { phraseHebrew, builtinEn } or null when the phrase does not exist.
 */
function resolvePhrase(post, anchor) {
	if (!post) return null;
	if (anchor.sectionId !== undefined && anchor.phraseId !== undefined
		&& Array.isArray(post.phraseTranslations)) {
		const entry = post.phraseTranslations.find(p =>
			String(p?.sectionId) === String(anchor.sectionId)
			&& String(p?.phraseId) === String(anchor.phraseId));
		if (entry) {
			return {
				phraseHebrew: String(entry.source?.hebrew || entry.hebrew || entry.he || ''),
				builtinEn: String(entry.en || entry.english || '')
			};
		}
	}
	const units = Array.isArray(post.units) ? post.units : null;
	if (units && anchor.unitIndex !== undefined && anchor.phraseIndex !== undefined) {
		const unit = units[Number(anchor.unitIndex)];
		const arr = unit?.phraseTranslations || unit?.phrases;
		const entry = Array.isArray(arr) ? arr[Number(anchor.phraseIndex)] : null;
		if (entry) {
			return {
				phraseHebrew: String(entry.source?.hebrew || entry.hebrew || entry.he || ''),
				builtinEn: String(entry.en || entry.english || '')
			};
		}
	}
	return null;
}

function readAll($i, heichelId, postId) {
	const ids = access.array(access.read($i, allPath(heichelId, postId), []));
	const out = [];
	for (const id of ids) {
		const rec = access.read($i, recordPath(heichelId, postId, id), null);
		if (rec && !rec.deleted) out.push(rec);
	}
	return out;
}

async function addAnnotation({ $i, userid, heichelId, seriesId, postId, body }) {
	const authorUserId = resolveUserId($i, userid);
	if (!authorUserId) return er({ code: 'NO_LOGIN', message: 'Login required to add a translation annotation.' });
	const aliasId = body.aliasId || body.authorAliasId || '';
	if (!aliasId) return er({ code: 'MISSING_PARAMS', message: 'aliasId (the alias you write as) is required.' });
	let owns = false;
	try { owns = Boolean(await verifyAliasOwnership(aliasId, $i, authorUserId)); } catch { owns = false; }
	if (!owns && !isPlatformOperator($i, authorUserId)) {
		return er({ code: 'NOT_AUTHORIZED', message: 'Alias ownership required to annotate as this alias.' });
	}
	if (!body.text || typeof body.text !== 'string') {
		return er({ code: 'MISSING_PARAMS', message: 'text is required.' });
	}
	const anchor = {
		heichelId, seriesId, postId,
		sectionId: body.sectionId, phraseId: body.phraseId,
		unitIndex: body.unitIndex, phraseIndex: body.phraseIndex
	};
	const hasSectionAnchor = anchor.sectionId !== undefined && anchor.phraseId !== undefined;
	const hasUnitAnchor = anchor.unitIndex !== undefined && anchor.phraseIndex !== undefined;
	if (!hasSectionAnchor && !hasUnitAnchor) {
		return er({ code: 'MISSING_PARAMS', message: 'Anchor requires sectionId+phraseId or unitIndex+phraseIndex.' });
	}
	const post = await readSourcePost($i, { heichelId, postId });
	const resolved = resolvePhrase(post, anchor);
	if (!resolved) {
		return er({ code: 'ANCHOR_NOT_FOUND', message: 'The anchored phrase does not exist on this post (or the post could not be read).' });
	}
	const now = Date.now();
	const rec = {
		id: freshId(aliasId),
		kind: 'translationAnnotation',
		anchor,
		phraseHebrew: resolved.phraseHebrew,
		builtinEnSnapshot: resolved.builtinEn,
		text: body.text,
		language: String(body.language || 'en'),
		source: String(body.source || 'user'),
		versionNote: String(body.versionNote || ''),
		authorAliasId: aliasId,
		authorUserId,
		createdAt: now,
		updatedAt: now,
		deleted: false
	};
	access.write($i, recordPath(heichelId, postId, rec.id), rec);
	access.writeIndex($i, allPath(heichelId, postId), rec.id);
	if (hasSectionAnchor) access.writeIndex($i, phrasePath(heichelId, postId, anchor.sectionId, anchor.phraseId), rec.id);
	if (hasUnitAnchor) access.writeIndex($i, unitPath(heichelId, postId, anchor.unitIndex, anchor.phraseIndex), rec.id);
	return { success: rec };
}

function listForPost({ $i, heichelId, postId, language, authorAliasId, sectionId }) {
	let rows = readAll($i, heichelId, postId);
	if (language) rows = rows.filter(r => r.language === String(language));
	if (authorAliasId) rows = rows.filter(r => r.authorAliasId === String(authorAliasId));
	if (sectionId) rows = rows.filter(r => String(r.anchor?.sectionId) === String(sectionId));
	const perPhrase = {};
	for (const r of readAll($i, heichelId, postId)) {
		const key = r.anchor?.sectionId !== undefined
			? `${r.anchor.sectionId}/${r.anchor.phraseId}`
			: `unit:${r.anchor?.unitIndex}/${r.anchor?.phraseIndex}`;
		perPhrase[key] = (perPhrase[key] || 0) + 1;
	}
	return { success: rows, meta: { total: rows.length, perPhrase } };
}

function listForPhrase({ $i, heichelId, postId, sectionId, phraseId, unitIndex, phraseIndex }) {
	let ids;
	if (sectionId !== undefined && phraseId !== undefined) {
		ids = access.array(access.read($i, phrasePath(heichelId, postId, sectionId, phraseId), []));
	} else {
		ids = access.array(access.read($i, unitPath(heichelId, postId, unitIndex, phraseIndex), []));
	}
	const out = [];
	for (const id of ids) {
		const rec = access.read($i, recordPath(heichelId, postId, id), null);
		if (rec && !rec.deleted) out.push(rec);
	}
	return { success: out, meta: { total: out.length, authors: [...new Set(out.map(r => r.authorAliasId))] } };
}

function canModify($i, userid, rec) {
	const uid = resolveUserId($i, userid);
	if (!uid) return false;
	return uid === String(rec.authorUserId) || isPlatformOperator($i, uid);
}

async function updateAnnotation({ $i, userid, heichelId, postId, annotationId, body }) {
	const rec = access.read($i, recordPath(heichelId, postId, annotationId), null);
	if (!rec || rec.deleted) return er({ code: 'NOT_FOUND', message: 'Annotation not found.' });
	if (!canModify($i, userid, rec)) return er({ code: 'NOT_AUTHORIZED', message: 'Only the annotation author or admin may edit it.' });
	const next = { ...rec, updatedAt: Date.now() };
	if (typeof body.text === 'string') next.text = body.text;
	if (typeof body.language === 'string') next.language = body.language;
	if (typeof body.versionNote === 'string') next.versionNote = body.versionNote;
	access.write($i, recordPath(heichelId, postId, annotationId), next);
	return { success: next };
}

async function deleteAnnotation({ $i, userid, heichelId, postId, annotationId }) {
	const rec = access.read($i, recordPath(heichelId, postId, annotationId), null);
	if (!rec || rec.deleted) return er({ code: 'NOT_FOUND', message: 'Annotation not found.' });
	if (!canModify($i, userid, rec)) return er({ code: 'NOT_AUTHORIZED', message: 'Only the annotation author or admin may delete it.' });
	const tombstone = { ...rec, deleted: true, deletedAt: Date.now(), updatedAt: Date.now() };
	access.write($i, recordPath(heichelId, postId, annotationId), tombstone);
	return { success: { deleted: 1, id: annotationId } };
}

module.exports = {
	addAnnotation,
	canModify,
	deleteAnnotation,
	listForPhrase,
	listForPost,
	resolvePhrase,
	resolveUserId,
	updateAnnotation
};
