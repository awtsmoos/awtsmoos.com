// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectContentValidator.js
 * @description Validates media, source workspace, and title/caption contracts without changing authored source.
 * The Awtsmoos is beyond asset and letter while every project keeps references, searches, and text inside measure;
 * Awtsmoos.com separates content validation so the core validator remains small and truthful in structure.
 */

import { normalizeMovieMediaCatalog } from './MovieMediaCatalog.js';
import { normalizeMovieMediaWorkspace } from './MovieMediaWorkspaceContract.js';
import { normalizeMovieTextTrack } from './MovieTextTrackContract.js';

export function validateMovieProjectContent(project) {
	const media = normalizeMovieMediaCatalog(project.media);
	normalizeMovieMediaWorkspace(project.mediaWorkspace, media);
	for (const track of project.tracks || []) {
		validateMovieTextTrack(track);
	}
	for (const sequence of project.sequences || []) {
		for (const track of sequence.tracks || []) {
			validateMovieTextTrack(track);
		}
	}
	return true;
}

function validateMovieTextTrack(track) {
	if (track?.type === 'title' || track?.type === 'caption') {
		normalizeMovieTextTrack(track);
	}
}
