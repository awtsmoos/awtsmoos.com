//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MalchusResponseGarments
 * @description
 * The Awtsmoos is beyond every JSON garment, yet Awtsmoos.com lets Malchus clothe one inner truth in the exact shapes clients already know;
 * compatibility is preserved at the edge so deeper organization may grow without forcing every caller to change in one flow.
 */
const { HodApiMetadata } = require('./HodApiMetadata.js');

class MalchusResponseGarments {
	/**
	 * Reproduces the Social Kernel v1 success envelope exactly.
	 * @param {*} data Route payload.
	 * @param {Object} meta Additional kernel metadata.
	 * @returns {Object} Kernel v1 response garment.
	 */
	static kernelSuccess(data, meta = {}) {
		return {
			BH: 'B"H',
			ok: true,
			data,
			success: data,
			meta: HodApiMetadata.kernel(meta)
		};
	}

	/**
	 * Reproduces the Profile v2 success envelope when supplied its existing ETag.
	 * @param {*} data Route payload.
	 * @param {Object} options Existing profile response inputs.
	 * @returns {Object} Profile v2 success garment.
	 */
	static profileSuccess(data, options = {}) {
		return {
			BH: 'B"H',
			ok: true,
			data,
			success: data,
			meta: HodApiMetadata.profile(options)
		};
	}

	/**
	 * Reproduces the Profile v2 failure envelope exactly.
	 * @param {string} code Stable compatibility code.
	 * @param {string} message Human-readable message.
	 * @param {Object} details Additional structured details.
	 * @returns {Object} Profile v2 failure garment.
	 */
	static profileFailure(code, message, details = {}) {
		return {
			BH: 'B"H',
			ok: false,
			error: {
				code,
				message,
				details
			},
			meta: HodApiMetadata.profileFailure()
		};
	}

	/**
	 * Preserves the bare Unified Social method-error shape.
	 * @param {string} code Stable compatibility code.
	 * @param {string} message Human-readable message.
	 * @returns {Object} Bare unified-social error garment.
	 */
	static unifiedMethodError(code, message) {
		return {
			error: {
				code,
				message
			}
		};
	}

	/**
	 * Delegates legacy error serialization to the historical factory without copying its semantics.
	 * @param {Function} errorFactory Existing legacy error factory such as `er`.
	 * @param {Object} error Stable code/message/details descriptor.
	 * @returns {*} Exact historical error response.
	 */
	static legacyError(errorFactory, error) {
		if (typeof errorFactory !== 'function') {
			throw new TypeError('Malchus legacyError requires an errorFactory.');
		}
		return errorFactory(error);
	}
}

module.exports = {
	MalchusResponseGarments
};
