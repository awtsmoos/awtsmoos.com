// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandCatalogMediaTextEntries.js
 * @description Declares discoverable media-bin, relinking, title, lower-third, caption, and interchange commands.
 * The Awtsmoos is beyond asset and word while every finite operation needs an inspectable payload covenant;
 * Awtsmoos.com gives command palettes and agents one immutable catalog for portable media and text content.
 */

export const MOVIE_COMMAND_CATALOG_MEDIA_TEXT_ENTRIES = Object.freeze({
	addCaption: entry('Text', 'Add caption', { caption: 'Required caption clip.', trackId: 'Optional caption track id.' }),
	addMedia: entry('Media', 'Add media asset', { media: 'Required media item.' }),
	addTitle: entry('Text', 'Add title or lower third', { title: 'Required title clip.', trackId: 'Optional title track id.' }),
	importCaptions: entry('Text', 'Import SRT or WebVTT captions', {
		format: 'Optional srt or vtt format.',
		language: 'Optional language code.',
		replace: 'False appends instead of replacing.',
		text: 'Required SRT or WebVTT text.',
		trackId: 'Optional caption track id.'
	}),
	relinkMedia: entry('Media', 'Relink media asset', {
		mediaId: 'Required media identity.',
		proxyUrl: 'Optional proxy URL.',
		url: 'Required replacement URL.'
	}),
	removeCaption: entry('Text', 'Remove caption', { captionId: 'Required caption identity.', trackId: 'Optional track id.' }),
	removeMedia: entry('Media', 'Remove media asset', { force: 'Force clears references.', mediaId: 'Required media identity.' }),
	removeTitle: entry('Text', 'Remove title', { titleId: 'Required title identity.', trackId: 'Optional track id.' }),
	replaceMediaReferences: entry('Media', 'Replace media references', {
		fromMediaId: 'Required source media identity.',
		toMediaId: 'Required replacement media identity.'
	}),
	updateCaption: entry('Text', 'Update caption', {
		captionId: 'Required caption identity.',
		patch: 'Required caption changes.',
		trackId: 'Optional track id.'
	}),
	updateMedia: entry('Media', 'Update media metadata', { mediaId: 'Required media identity.', patch: 'Required media changes.' }),
	updateTitle: entry('Text', 'Update title', {
		patch: 'Required title changes.',
		titleId: 'Required title identity.',
		trackId: 'Optional track id.'
	})
});

function entry(category, title, payload) {
	return Object.freeze({
		batchable: true,
		category,
		mutatesProject: true,
		payload: Object.freeze(payload),
		requiresSelection: false,
		shortcut: null,
		title,
		undoable: true
	});
}
