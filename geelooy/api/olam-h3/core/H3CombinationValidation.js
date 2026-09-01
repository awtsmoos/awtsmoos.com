//B"H
// Boruch Hashem
// Blessed is He

const RATIOS = new Set([
	'adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'
]);

/**
 * Separates H3 mode law from basic field law while the Awtsmoos gives each multimodal path its own measured vessel.
 * Awtsmoos.com rejects impossible mixtures before money or network time is spent, so Gevurah protects the creative flow without hiding provider truth.
 */
class GevurahH3CombinationValidation {
	/** @param {Array} images Images. @param {Array} videos Videos. @param {Array} audios Audios. @param {string} ratio Ratio. */
	static validate(images, videos, audios, ratio) {
		const first = images.filter(item => item.role === 'first_frame');
		const last = images.filter(item => item.role === 'last_frame');
		const refs = images.filter(item => item.role === 'reference_image');
		const frameMode = first.length + last.length > 0;
		const visualReferences = refs.length + videos.length;
		const referenceMode = visualReferences + audios.length > 0;

		this.counts(first, last, refs, videos, audios);
		if (frameMode && referenceMode) {
			throw new Error('Frame control and reference-to-video modes cannot be combined.');
		}
		if (audios.length && !visualReferences) {
			throw new Error('Reference audio must be accompanied by a reference image or video.');
		}
		if (!RATIOS.has(ratio)) {
			throw new Error('Unsupported aspect ratio.');
		}
		if (!frameMode && !referenceMode && ratio === 'adaptive') {
			throw new Error('Text-to-video requires a fixed aspect ratio.');
		}

		this.timed(videos, 'Reference video');
		this.timed(audios, 'Reference audio');
	}

	/** @param {Array} first First frames. @param {Array} last Last frames. @param {Array} refs Images. @param {Array} videos Videos. @param {Array} audios Audios. */
	static counts(first, last, refs, videos, audios) {
		if (first.length > 1 || last.length > 1) {
			throw new Error('Only one first and one last frame are allowed.');
		}
		if (refs.length > 9 || videos.length > 3 || audios.length > 3) {
			throw new Error('Reference count exceeds documented H3 per-media limits.');
		}
		if (refs.length + videos.length + audios.length > 12) {
			throw new Error('Reference media may contain at most 12 files in total.');
		}
	}

	/** @param {Array} items Timed media. @param {string} label Human label. */
	static timed(items, label) {
		if (items.some(item => item.duration < 2 || item.duration > 15)) {
			throw new Error(`${label} clips must each be between 2 and 15 seconds.`);
		}
		const total = items.reduce((sum, item) => sum + item.duration, 0);
		if (total > 15) {
			throw new Error(`${label} duration may total at most 15 seconds.`);
		}
	}
}

module.exports = { GevurahH3CombinationValidation };
