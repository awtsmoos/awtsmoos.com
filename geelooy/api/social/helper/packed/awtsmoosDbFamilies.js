// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AwtsmoosDbFamilies
 * @description
 * The Awtsmoos keeps the old comments ocean behind its historical doorway.
 * Modern rich-comment paths remain inside safe social entity families only.
 */
const path = require('path');
const { toVirtualPath } = require('./awtsmoosDbFsBridge.js');

function normalizeSocialPath(id) {
	return toVirtualPath(id).replace(/\/$/, '');
}

function removeJsonExtension(name) {
	return String(name || '').replace(/\.(awtsmoosJSON|json)$/i, '');
}

function pathWithDefaultExtension(id) {
	const clean = normalizeSocialPath(id);
	return path.posix.extname(clean) ? clean : `${clean}.awtsmoosJSON`;
}

function possibleFilePaths(id) {
	const clean = normalizeSocialPath(id);
	return path.posix.extname(clean)
		? [clean]
		: [clean, `${clean}.awtsmoosJSON`, `${clean}.json`];
}

function isModernRichCommentPath(id) {
	const clean = normalizeSocialPath(id);
	return /\/posts\/[^/]+\/commentTree(?:\/|$)/.test(clean)
		|| clean === '/social/commentUrls'
		|| clean.startsWith('/social/commentUrls/');
}

function familyForPath(id) {
	const clean = normalizeSocialPath(id);
	if (isModernRichCommentPath(clean)) return ['series', 'posts'];
	if (clean.includes('/comments/')) return ['comments', 'series', 'posts'];
	if (/\/series\/[^/]+\/posts(\.awtsmoosJSON)?$/i.test(clean)) {
		return ['posts', 'series'];
	}
	if (clean.includes('/series/')) return ['series', 'posts'];
	return ['series', 'comments', 'posts'];
}

function legacyFallbackAllowed(id) {
	return !isModernRichCommentPath(id);
}

function familyDbFiles({ packedDir, heichelId }) {
	return {
		comments: path.join(packedDir, `social.heichel.${heichelId}.comments.fs.awtsdb`),
		posts: path.join(packedDir, `social.heichel.${heichelId}.posts.fs.awtsdb`),
		series: path.join(packedDir, `social.heichel.${heichelId}.series.fs.awtsdb`)
	};
}

module.exports = {
	familyDbFiles,
	familyForPath,
	isModernRichCommentPath,
	legacyFallbackAllowed,
	normalizeSocialPath,
	pathWithDefaultExtension,
	possibleFilePaths,
	removeJsonExtension
};
