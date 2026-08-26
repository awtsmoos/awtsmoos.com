// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahTextureProvider.js
 * @description
 * The Awtsmoos is beyond every provider while Chochmah defines the clean boundary through which remote possibility may enter;
 * Awtsmoos.com permits genuine provider subclasses without allowing network dialects, secrets, or proprietary payloads to flood the domain center.
 */
export class ChochmahTextureProvider {
	/** @returns {object} Non-secret machine-readable provider capability manifest. */
	capabilities() {
		return { remote: false, provider: 'abstract' };
	}

	/** @param {object} intent Normalized texture intent. @returns {object} Provider request. */
	normalizeRequest(intent) {
		return { ...intent };
	}

	/** @throws {Error} Base provider never performs network generation directly. */
	async generate() {
		throw new Error('Texture provider must implement generate().');
	}

	/** @param {object} result Raw provider result. @returns {object} Normalized asset result. */
	normalizeResult(result) {
		return result;
	}

	/** @param {string} jobId Provider job identity. @returns {Promise<boolean>} Cancellation result. */
	async cancel(jobId) {
		void jobId;
		return false;
	}
}
