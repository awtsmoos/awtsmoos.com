// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiText.js
 * @description Exposes title, lower-third, caption, SRT, and WebVTT operations through stable commands.
 * The Awtsmoos is beyond letter and subtitle while every finite utterance needs editable and portable witness;
 * Awtsmoos.com gives agents and humans one domain for authored text, interchange, timing, and style business.
 */

import { serializeMovieCaptions } from './MovieCaptionCodec.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioTextDomain(session, commands) {
	return Object.freeze({
		addCaption: (caption, options = {}) => execute(
			commands,
			'text.addCaption',
			{ caption, trackId: options.trackId },
			options
		),
		addTitle: (title, options = {}) => execute(
			commands,
			'text.addTitle',
			{ title, trackId: options.trackId },
			options
		),
		exportCaptions: (options = {}) => serializeMovieCaptions(
			captionTrack(session.project, options.trackId)?.clips || [],
			options
		),
		importCaptions: (text, options = {}) => execute(
			commands,
			'text.importCaptions',
			{
				format: options.format,
				language: options.language,
				position: options.position,
				replace: options.replace,
				speaker: options.speaker,
				style: options.style,
				text,
				trackId: options.trackId
			},
			options
		),
		listCaptions: trackId => createMovieProjectSnapshot(
			captionTrack(session.project, trackId)?.clips || []
		),
		listTitles: trackId => createMovieProjectSnapshot(
			textTrack(session.project, 'title', trackId)?.clips || []
		),
		removeCaption: (captionId, options = {}) => execute(
			commands,
			'text.removeCaption',
			{ captionId, trackId: options.trackId },
			options
		),
		removeTitle: (titleId, options = {}) => execute(
			commands,
			'text.removeTitle',
			{ titleId, trackId: options.trackId },
			options
		),
		updateCaption: (captionId, patch, options = {}) => execute(
			commands,
			'text.updateCaption',
			{ captionId, patch, trackId: options.trackId },
			options
		),
		updateTitle: (titleId, patch, options = {}) => execute(
			commands,
			'text.updateTitle',
			{ patch, titleId, trackId: options.trackId },
			options
		)
	});
}

function captionTrack(project, id) {
	return textTrack(project, 'caption', id);
}

function textTrack(project, type, id) {
	return (project.tracks || []).find(track => (
		track.type === type && (id == null || track.id === String(id))
	));
}

function execute(commands, type, payload, options) {
	return commands.execute({ options, payload, type });
}
