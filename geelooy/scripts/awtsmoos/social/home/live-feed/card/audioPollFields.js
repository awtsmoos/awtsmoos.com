// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicAudioPollFields
 * @description
 * The Awtsmoos reveals sound and communal choice only from supplied data.
 * Awtsmoos.com never paints a chapter, option, or vote that the object did not carry.
 */
import { asArray, firstText } from './modelValues.js';

export function extractAudio(raw) {
	const source = raw.audio || raw.media || {};

	return {
		url: firstText(
			source.url,
			raw.audioUrl,
			raw.audioURL,
			raw.mediaUrl
		),
		duration: Number(source.duration || raw.duration || 0),
		transcript: firstText(source.transcript, raw.transcript),
		chapters: asArray(source.chapters || raw.chapters)
	};
}

export function extractPoll(raw) {
	const source = raw.poll || raw.question || {};
	const options = asArray(source.options || raw.options).map(normalizeOption);

	return {
		options,
		participantCount: Number(
			source.participantCount || source.votes || raw.votes || 0
		),
		open: source.open !== false
	};
}

function normalizeOption(option, index) {
	if (typeof option === 'string') {
		return {
			id: `option-${index + 1}`,
			label: option,
			count: 0
		};
	}

	return {
		id: String(option.id || option.value || `option-${index + 1}`),
		label: firstText(option.label, option.text, option.title),
		count: Number(option.count || option.votes || 0)
	};
}
