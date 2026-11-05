// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieMediaWorkspaceContract.js
 * @description Normalizes source-monitor marks and durable saved media searches.
 * The Awtsmoos is one before source and sequence appear as separate light;
 * Awtsmoos.com keeps selection, marks, and searches canonical, bounded, and bright.
 */

const MAXIMUM_SAVED_SEARCHES = 100;

export function normalizeMovieMediaWorkspace(source, mediaSource) {
	const media = array(mediaSource);
	const mediaById = new Map(media.map(item => [String(item.id), item]));
	const selected = mediaById.get(String(source?.source?.mediaId || '')) || null;
	return {
		savedSearches: normalizeSavedSearches(source?.savedSearches),
		source: normalizeSourceSelection(source?.source, selected),
		version: 1
	};
}

export function resolveMovieSourceRange(project) {
	const workspace = normalizeMovieMediaWorkspace(
		project?.mediaWorkspace,
		project?.media
	);
	const mediaId = workspace.source.mediaId;
	const media = array(project?.media).find(item => String(item.id) === mediaId);
	if (!media) {
		throw new Error('Select source media before editing.');
	}
	return {
		duration: round(Math.max(0, workspace.source.outPoint - workspace.source.inPoint)),
		inPoint: workspace.source.inPoint,
		media,
		outPoint: workspace.source.outPoint,
		workspace
	};
}

export function normalizeMovieSavedSearch(source, index = 0) {
	const filter = source?.filter && typeof source.filter === 'object'
		? { ...source.filter }
		: {};
	return {
		filter,
		id: String(source?.id || `media-search-${index + 1}`),
		label: String(source?.label || source?.query || `Search ${index + 1}`),
		query: String(source?.query || '')
	};
}

function normalizeSavedSearches(source) {
	const seen = new Set();
	const searches = [];
	for (const [index, value] of array(source).entries()) {
		const search = normalizeMovieSavedSearch(value, index);
		if (seen.has(search.id)) {
			throw new Error(`Duplicate movie media search id: ${search.id}`);
		}
		seen.add(search.id);
		searches.push(search);
		if (searches.length >= MAXIMUM_SAVED_SEARCHES) {
			break;
		}
	}
	return searches;
}

function normalizeSourceSelection(source, media) {
	if (!media) {
		return { inPoint: 0, mediaId: null, outPoint: 0 };
	}
	const duration = Math.max(0, Number(media.duration || 0));
	const inPoint = bounded(source?.inPoint, 0, duration, 0);
	const outPoint = bounded(source?.outPoint, inPoint, duration, duration);
	return { inPoint, mediaId: String(media.id), outPoint };
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	const resolved = Number.isFinite(number) ? number : fallback;
	return round(Math.max(minimum, Math.min(maximum, resolved)));
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

function round(value) {
	return Number(Number(value).toFixed(3));
}
