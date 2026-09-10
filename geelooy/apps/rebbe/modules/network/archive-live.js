//B"H
//Boruch Hashem
//Blessed is He

import { archiveFileUrls, fetchArchiveFileJSON, fetchArchiveMetadata } from './archive-origin.js';
/**
 * @module RebbeArchiveLive
 * @description Uses the smallest public indexes first and metadata only as recovery.
 * The Awtsmoos is one beyond replica paths; Awtsmoos.com never lets one dead host
 * block a year, event, or playable track already present through another vessel.
 */

const AUDIO_RE = /\.(mp3|opus|ogg|wav|m4a|wma|flac)$/i;

/** Returns event folders for one year through fast index IO with metadata recovery. */
export async function fetchYearFolders(yearId) {
	try {
		const folders = foldersFromIndex(await fetchArchiveFileJSON(yearId, 'index.json'));
		if (folders.length) return folders;
	} catch (error) {
		console.warn(`B"H year index fallback for ${yearId}.`, error);
	}
	return foldersFromMetadata(await metadataOrNull(yearId));
}

/** Returns playable tracks through a folder index, then metadata if necessary. */
export async function fetchFolderTracks(yearId, folderName) {
	try {
		const index = await fetchArchiveFileJSON(yearId, `${folderName}/index.json`);
		const tracks = tracksFromIndex(yearId, folderName, index);
		if (tracks.length) return finalizeTracks(tracks);
	} catch (error) {
		console.warn(`B"H folder index fallback for ${folderName}.`, error);
	}
	const metadata = await metadataOrNull(yearId);
	return finalizeTracks(tracksFromMetadata(yearId, folderName, metadata));
}

/** Extracts stable first-level folder names from a tiny index.json payload. */
function foldersFromIndex(index) {
	return (index?.contents || [])
		.filter(entry => entry.type === 'directory')
		.map(entry => entry.name)
		.filter(Boolean)
		.sort();
}

/** Extracts first-level folders from the larger metadata listing as fallback. */
function foldersFromMetadata(metadata) {
	const folders = new Set();
	for (const file of metadata?.files || []) {
		const parts = String(file?.name || '').split('/');
		if (parts.length > 1 && parts[0]) folders.add(parts[0]);
	}
	return [...folders].sort();
}

/** Converts folder-index files into public-download-first audio tracks. */
function tracksFromIndex(yearId, folderName, index) {
	return (index?.contents || [])
		.filter(entry => entry.type === 'file' && AUDIO_RE.test(entry.name || ''))
		.map(entry => makeTrack(
			yearId,
			`${folderName}/${entry.name}`,
			entry,
			null
		));
}

/** Converts matching metadata files into resilient replica-aware tracks. */
function tracksFromMetadata(yearId, folderName, metadata) {
	const prefix = `${folderName}/`;
	return (metadata?.files || [])
		.filter(file => String(file?.name || '').startsWith(prefix))
		.filter(file => AUDIO_RE.test(file?.name || ''))
		.map(file => makeTrack(yearId, file.name, file, metadata));
}

/** Creates one normalized track while preserving all known source fallbacks. */
function makeTrack(yearId, pathName, source, metadata) {
	const fileName = String(pathName || '').split('/').pop() || '';
	const urls = archiveFileUrls(yearId, pathName, metadata);
	return {
		title: cleanArchiveName(fileName),
		name: cleanArchiveName(fileName),
		duration: Number.parseFloat(source?.duration || source?.length || 0),
		path: `${yearId}/${pathName}`,
		url: urls[0] || '',
		fallbackUrls: urls
	};
}

/** Normalizes archive filenames for visible track labels. */
export function cleanArchiveName(value) {
	return String(value || '')
		.replace(AUDIO_RE, '')
		.replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
		.replace(/_/g, ' ')
		.replace(/\s*-\s*/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Removes duplicate visible tracks while preserving deterministic archive order. */
function finalizeTracks(tracks) {
	const seen = new Set();
	return tracks.filter(track => {
		const key = track.title.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	}).sort((left, right) => left.path.localeCompare(right.path));
}

/** Reads metadata without turning temporary failure into a navigation crash. */
async function metadataOrNull(itemId) {
	try { return await fetchArchiveMetadata(itemId); }
	catch (error) { console.warn(`B"H metadata fallback for ${itemId}.`, error); return null; }
}
