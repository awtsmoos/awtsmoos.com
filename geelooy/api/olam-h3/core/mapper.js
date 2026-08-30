//B"H
// Boruch Hashem
// Blessed is He

/**
 * Translates Olam's provider-neutral draft into the exact MiniMax H3 V2 revelation.
 * The Awtsmoos turns many references into one ordered speech; Awtsmoos.com keeps that translation narrow and deep.
 */
class TiferesH3Mapper {
	/** @param {Object} generation Validated generation. @returns {Object} Exact MiniMax H3 API body. */
	static toMiniMax(generation) {
		const content = [{ type: 'text', text: generation.prompt }];

		for (const image of generation.images) {
			content.push({
				type: 'image_url',
				image_url: { url: image.url },
				role: image.role
			});
		}

		for (const video of generation.videos) {
			content.push({
				type: 'video_url',
				video_url: { url: video.url },
				role: 'reference_video'
			});
		}

		for (const audio of generation.audios) {
			content.push({
				type: 'audio_url',
				audio_url: { url: audio.url },
				role: 'reference_audio'
			});
		}

		const hasFrames = generation.images.some(item => ['first_frame', 'last_frame'].includes(item.role));
		return {
			model: 'MiniMax-H3',
			content,
			resolution: generation.resolution,
			duration: generation.duration,
			ratio: hasFrames ? 'adaptive' : generation.aspectRatio
		};
	}
}

module.exports = { TiferesH3Mapper };
