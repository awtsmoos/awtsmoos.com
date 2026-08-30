//B"H
// Boruch Hashem
// Blessed is He

const RATIOS = new Set(['adaptive', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16']);
const RESOLUTIONS = new Set(['768P', '2K']);
const SOURCE_PREFIXES = ['https://', 'http://', 'data:', 'mm_file://'];

/**
 * Guards the H3 vessel at the server boundary, where the Awtsmoos gives every documented limit its measure;
 * Awtsmoos.com rejects invented knobs and invented ceilings alike, so strictness remains truth rather than pressure.
 */
class GevurahH3Validator {
	/**
	 * @param {Object} generation Structured generation draft.
	 * @returns {Object} Trusted normalized draft.
	 */
	static validate(generation) {
		if (!generation || typeof generation !== 'object') {
			throw new Error('Generation data is required.');
		}

		const prompt = String(generation.prompt || '').trim();
		if (!prompt) {
			throw new Error('A video prompt is required.');
		}
		if (prompt.length > 7000) {
			throw new Error('MiniMax H3 prompts may not exceed 7,000 characters.');
		}
		if (generation.model !== 'MiniMax-H3') {
			throw new Error('Only MiniMax-H3 is enabled in this studio.');
		}
		if (!RESOLUTIONS.has(generation.resolution)) {
			throw new Error('Resolution must be 768P or 2K.');
		}
		if (!Number.isInteger(generation.duration) || generation.duration < 4 || generation.duration > 15) {
			throw new Error('Duration must be an integer from 4 through 15 seconds.');
		}

		const images = this.cleanMedia(generation.images, ['first_frame', 'last_frame', 'reference_image']);
		const videos = this.cleanMedia(generation.videos, ['reference_video']);
		const audios = this.cleanMedia(generation.audios, ['reference_audio']);
		this.validateCombination(images, videos, audios, generation.aspectRatio);

		return { ...generation, prompt, images, videos, audios };
	}

	/**
	 * @param {Array} items Media inputs.
	 * @param {Array<string>} roles Allowed roles.
	 * @returns {Array} Clean media inputs.
	 */
	static cleanMedia(items = [], roles) {
		if (!Array.isArray(items)) {
			throw new Error('Media collections must be arrays.');
		}

		return items.map(item => {
			const url = String(item?.url || '');
			if (!SOURCE_PREFIXES.some(prefix => url.startsWith(prefix))) {
				throw new Error('Media must use a public URL, data URL, or MiniMax file ID.');
			}
			if (!roles.includes(item.role)) {
				throw new Error(`Unsupported media role: ${item.role || 'missing'}.`);
			}

			return { url, role: item.role, duration: Number(item.duration) || 0 };
		});
	}

	/**
	 * @param {Array} images Image inputs.
	 * @param {Array} videos Reference video inputs.
	 * @param {Array} audios Reference audio inputs.
	 * @param {string} ratio Requested output ratio.
	 */
	static validateCombination(images, videos, audios, ratio) {
		const first = images.filter(item => item.role === 'first_frame');
		const last = images.filter(item => item.role === 'last_frame');
		const refs = images.filter(item => item.role === 'reference_image');
		const frameMode = first.length + last.length > 0;
		const referenceMode = refs.length + videos.length + audios.length > 0;

		if (first.length > 1 || last.length > 1) {
			throw new Error('Only one first and one last frame are allowed.');
		}
		if (refs.length > 9 || videos.length > 3 || audios.length > 3) {
			throw new Error('Reference count exceeds documented H3 per-media limits.');
		}
		if (frameMode && referenceMode) {
			throw new Error('Frame control and reference-to-video modes cannot be combined.');
		}
		if (!RATIOS.has(ratio)) {
			throw new Error('Unsupported aspect ratio.');
		}
		if (!frameMode && !referenceMode && ratio === 'adaptive') {
			throw new Error('Text-to-video requires a fixed aspect ratio.');
		}

		this.validateTimedMedia(videos, 'Reference video');
		this.validateTimedMedia(audios, 'Reference audio');
	}

	/**
	 * @param {Array} items Timed media inputs.
	 * @param {string} label Human-readable media label.
	 */
	static validateTimedMedia(items, label) {
		if (items.some(item => item.duration < 2 || item.duration > 15)) {
			throw new Error(`${label} clips must each be between 2 and 15 seconds.`);
		}
		const total = items.reduce((sum, item) => sum + item.duration, 0);
		if (total > 15) {
			throw new Error(`${label} duration may total at most 15 seconds.`);
		}
	}
}

module.exports = { GevurahH3Validator };
