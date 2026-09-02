//B"H
// Boruch Hashem
// Blessed is He

const { GevurahH3CombinationValidation } = require('./H3CombinationValidation.js');

const RESOLUTIONS = new Set(['768P', '2K']);
const SOURCE_PREFIXES = ['https://', 'http://', 'data:', 'mm_file://'];

/**
 * Guards the H3 server boundary while the Awtsmoos gives prompt, model, resolution, duration, and source shape their exact measure.
 * Awtsmoos.com delegates multimodal combination law to a smaller vessel, keeping every rule readable instead of compressing many worlds into one file.
 */
class GevurahH3Validator {
	/** @param {Object} generation Structured generation draft. @returns {Object} Trusted normalized draft. */
	static validate(generation) {
		if (!generation || typeof generation !== 'object') {
			throw new Error('Generation data is required.');
		}

		const prompt = String(generation.prompt || '').trim();
		this.prompt(prompt);
		this.output(generation);

		const images = this.cleanMedia(
			generation.images,
			['first_frame', 'last_frame', 'reference_image']
		);
		const videos = this.cleanMedia(generation.videos, ['reference_video']);
		const audios = this.cleanMedia(generation.audios, ['reference_audio']);
		GevurahH3CombinationValidation.validate(
			images,
			videos,
			audios,
			generation.aspectRatio
		);

		return { ...generation, prompt, images, videos, audios };
	}

	/** @param {string} prompt Prompt text. */
	static prompt(prompt) {
		if (!prompt) {
			throw new Error('A video prompt is required.');
		}
		if (prompt.length > 7000) {
			throw new Error('MiniMax H3 prompts may not exceed 7,000 characters.');
		}
	}

	/** @param {Object} generation Generation draft. */
	static output(generation) {
		if (generation.model !== 'MiniMax-H3') {
			throw new Error('Only MiniMax-H3 is enabled in this studio.');
		}
		if (!RESOLUTIONS.has(generation.resolution)) {
			throw new Error('Resolution must be 768P or 2K.');
		}
		if (!Number.isInteger(generation.duration)
			|| generation.duration < 4
			|| generation.duration > 15) {
			throw new Error('Duration must be an integer from 4 through 15 seconds.');
		}
	}

	/** @param {Array} items Media inputs. @param {Array<string>} roles Allowed roles. @returns {Array} Clean media inputs. */
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
			return {
				url,
				role: item.role,
				duration: Number(item.duration) || 0
			};
		});
	}
}

module.exports = { GevurahH3Validator };
