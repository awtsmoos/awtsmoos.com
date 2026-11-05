// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaRelinkSuggestions.js
 * @description Scores candidate URLs against offline media without committing uncertain matches.
 * The Awtsmoos knows identity beyond filename and extension; Awtsmoos.com offers finite clues
 * as ranked suggestions, never transforming a heuristic resemblance into an automatic decree.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function suggestMovieMediaRelinks(project = {}, candidates = [], options = {}) {
	const limit = Math.max(1, Math.min(20, Number(options.limit || 5)));
	const normalized = candidates.map(normalizeCandidate).filter(item => item.url);
	const suggestions = (project.media || [])
		.filter(item => item.status === 'offline' || !item.url)
		.map(item => ({
			mediaId: item.id,
			matches: normalized
				.map(candidate => scoreCandidate(item, candidate))
				.filter(match => match.score > 0)
				.sort((left, right) => right.score - left.score || left.url.localeCompare(right.url))
				.slice(0, limit)
		}));
	return createMovieProjectSnapshot(suggestions);
}

function normalizeCandidate(value) {
	const url = String(value?.url || value || '').trim();
	const label = String(value?.label || filename(url));
	return {
		extension: extension(url),
		kind: String(value?.kind || ''),
		label,
		stem: stem(label),
		url
	};
}

function scoreCandidate(item, candidate) {
	const itemLabel = String(item.label || item.id);
	const itemName = filename(item.url || itemLabel).toLowerCase();
	const itemStem = stem(item.url || itemLabel);
	let score = 0;
	if (itemName && itemName === filename(candidate.url).toLowerCase()) score += 100;
	if (itemStem && itemStem === candidate.stem) score += 70;
	if (extension(item.url || '') === candidate.extension && candidate.extension) score += 15;
	if (stem(itemLabel) === candidate.stem) score += 20;
	if (candidate.kind && candidate.kind === item.kind) score += 10;
	return { label: candidate.label, score: Math.min(100, score), url: candidate.url };
}

function filename(value) {
	return String(value || '').split(/[?#]/)[0].split('/').pop() || '';
}

function extension(value) {
	const match = filename(value).toLowerCase().match(/\.([a-z0-9]+)$/);
	return match?.[1] || '';
}

function stem(value) {
	return filename(value).toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '');
}
