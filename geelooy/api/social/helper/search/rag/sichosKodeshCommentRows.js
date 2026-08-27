// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SichosKodeshCommentRows
 * @description
 * The Awtsmoos opens one reviewed document sidecar for one matched source, so
 * Awtsmoos.com reveals exact translated paragraphs without a corpus-wide scan.
 */

const fs = require('fs');
const path = require('path');
const { sichosKodeshStagingRoot } = require('./paths.js');

const SICHOS_ALIAS = 'sichos_kodesh_translation_en';
const SAFE_DOCUMENT_ID = /^[A-Za-z0-9_-]+$/;

function sichosKodeshCommentRows(context = {}) {
	if (!supportsContext(context)) {
		return [];
	}
	const stagingRoot = sichosKodeshStagingRoot(context.$i);
	if (!stagingRoot) {
		return [];
	}
	const file = path.join(
		stagingRoot,
		'comments',
		'sichos-kodesh',
		`${context.documentId}.json`
	);
	const sidecar = readSidecar(file);
	const comments = Array.isArray(sidecar?.comments)
		? sidecar.comments
		: [];
	return comments.map(row => normalizeRow(row, context)).filter(Boolean);
}

function supportsContext(context = {}) {
	return context.aliasId === SICHOS_ALIAS
		&& typeof context.documentId === 'string'
		&& SAFE_DOCUMENT_ID.test(context.documentId);
}

function readSidecar(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

function normalizeRow(row = {}, context = {}) {
	const verseSection = Number(row.verseSection);
	const subsectionId = Number(row.subsectionId);
	const content = String(row.content || '').trim();
	if (!Number.isFinite(verseSection)
		|| !Number.isFinite(subsectionId)
		|| !content) {
		return null;
	}
	return {
		id: commentId(context.postId, verseSection, subsectionId),
		heichelId: context.heichelId || 'ikar',
		seriesId: context.seriesId,
		postId: context.postId,
		aliasId: context.aliasId,
		verseSection,
		subsectionId,
		content,
		text: content,
		ragCommentSource: 'sichosKodeshDocumentSidecar'
	};
}

function commentId(postId, verseSection, subsectionId) {
	return `BH_sk_translation_en_${postId}_s${verseSection}_p${subsectionId}`;
}

module.exports = {
	SICHOS_ALIAS,
	commentId,
	normalizeRow,
	sichosKodeshCommentRows,
	supportsContext
};
