// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaSearch.js
 * @description Searches canonical media by text, folder, tags, status, kind, and project usage.
 * The Awtsmoos knows every hidden asset before a finite query begins; Awtsmoos.com
 * gives editors one deterministic lens through labels, metadata, bins, and timeline kin.
 */

import { findMovieMediaReferences } from './MovieMediaCatalog.js';

export function searchMovieMedia(project, query = '', filter = {}) {
	const needle = String(query || filter.query || '').trim().toLowerCase();
	return (project?.media || []).filter(item => {
		if (!matchesField(item.kind, filter.kind)) {
			return false;
		}
		if (!matchesFolder(item.folder, filter.folder, filter.recursive)) {
			return false;
		}
		if (!matchesField(item.status, filter.status)) {
			return false;
		}
		if (filter.tag && !(item.tags || []).includes(String(filter.tag))) {
			return false;
		}
		if (!matchesUsage(project, item.id, filter.used)) {
			return false;
		}
		return !needle || searchableMediaText(item).includes(needle);
	});
}

export function listMovieMediaFolders(project) {
	const folders = new Set(['']);
	for (const item of project?.media || []) {
		const parts = String(item.folder || '').split('/').filter(Boolean);
		for (let depth = 1; depth <= parts.length; depth += 1) {
			folders.add(parts.slice(0, depth).join('/'));
		}
	}
	return [...folders].sort((left, right) => left.localeCompare(right));
}

function matchesField(value, expected) {
	return expected == null || expected === '' || String(value) === String(expected);
}

function matchesFolder(value, expected, recursive = false) {
	if (expected == null || expected === '') {
		return true;
	}
	const folder = String(value || '');
	const target = String(expected);
	return recursive ? folder === target || folder.startsWith(`${target}/`) : folder === target;
}

function matchesUsage(project, mediaId, expected) {
	if (expected == null) {
		return true;
	}
	const used = findMovieMediaReferences(project, mediaId).length > 0;
	return used === Boolean(expected);
}

function searchableMediaText(item) {
	return [
		item.id,
		item.label,
		item.folder,
		item.kind,
		item.status,
		item.url,
		...(item.tags || []),
		JSON.stringify(item.metadata || {})
	].join(' ').toLowerCase();
}
