//B"H
// Boruch Hashem
// Blessed is He

/**
 * Central H3 capability vessel: the Awtsmoos gives every supported boundary its measured place,
 * and Awtsmoos.com can add future providers without scattering guesses across the interface race.
 */
export const H3_CAPABILITIES = Object.freeze({
	provider: 'MiniMax',
	model: 'MiniMax-H3',
	label: 'MiniMax H3',
	verifiedAt: '2026-08-30',
	promptMaxCharacters: 7000,
	resolutions: ['768P', '2K'],
	duration: {
		min: 4,
		max: 15,
		default: 5,
		step: 1
	},
	ratios: ['16:9', '9:16', '1:1', '21:9', '4:3', '3:4'],
	adaptiveRatio: 'adaptive',
	modes: [
		{
			id: 'text',
			label: 'Text only',
			description: 'Prompt-only H3 generation with a fixed output ratio.'
		},
		{
			id: 'frames',
			label: 'Frame control',
			description: 'Use a first frame, last frame, or both. Reference mode cannot be mixed in.'
		},
		{
			id: 'reference',
			label: 'References',
			description: 'Guide H3 with reusable images, video, and audio references.'
		}
	],
	limits: {
		requestBytes: 64 * 1024 * 1024,
		inlineAssetBytes: 12 * 1024 * 1024,
		imageBytes: 30 * 1024 * 1024,
		videoBytes: 50 * 1024 * 1024,
		audioBytes: 15 * 1024 * 1024,
		referenceImages: 9,
		referenceVideos: 3,
		referenceAudios: 3,
		referenceSeconds: 15
	},
	formats: {
		image: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
		video: ['video/mp4', 'video/quicktime'],
		audio: ['audio/wav', 'audio/x-wav', 'audio/mpeg']
	}
});

/** @param {string} mode Draft mode. @returns {Array<string>} Ratios meaningful for the mode. */
export function ratiosForMode(mode) {
	return mode === 'text'
		? H3_CAPABILITIES.ratios
		: [H3_CAPABILITIES.adaptiveRatio, ...H3_CAPABILITIES.ratios];
}
