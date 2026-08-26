//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GevurahRouteMethodPolicy
 * @description
 * The Awtsmoos is beyond every verb, yet each public doorway needs a measured boundary;
 * Awtsmoos.com lets Gevurah reject the wrong method with the route family's own stable error factory, so compatibility and order rhyme.
 *
 * RESPONSIBILITY:
 * Validate request methods and construct compatibility-preserving method errors.
 *
 * NON-RESPONSIBILITY:
 * This module does not parse bodies, authorize identities, call domain services, or serialize transport responses.
 */
class GevurahRouteMethodPolicy {
	/**
	 * Creates a method boundary whose error representation is supplied by the calling API family.
	 *
	 * @param {Object} options
	 * 	Construction options for the route boundary.
	 * @param {Function} options.errorFactory
	 * 	Function receiving `{ code, message }` and returning the route family's existing error envelope.
	 * @param {string} [options.errorCode="BAD_METHOD"]
	 * 	Default compatibility error code emitted for unsupported methods.
	 * @throws {TypeError}
	 * 	Thrown when no error factory is provided.
	 */
	constructor({
		errorFactory,
		errorCode = 'BAD_METHOD'
	} = {}) {
		if (typeof errorFactory !== 'function') {
			throw new TypeError(
				'GevurahRouteMethodPolicy requires an errorFactory.'
			);
		}

		this.errorFactory = errorFactory;
		this.errorCode = errorCode;
	}

	/**
	 * Determines whether the current request uses one exact method.
	 *
	 * @param {Object} requestContext
	 * 	The Awtsmoos route context containing `request.method`.
	 * @param {string} expected
	 * 	The allowed HTTP-like method.
	 * @returns {boolean}
	 * 	True only when the current request method exactly matches.
	 */
	is(requestContext, expected) {
		return requestContext?.request?.method === expected;
	}

	/**
	 * Returns null for an allowed method or the established error envelope otherwise.
	 *
	 * @param {Object} requestContext
	 * 	The current route context.
	 * @param {string|string[]} expected
	 * 	One method or a list of acceptable methods.
	 * @param {Object} [options]
	 * 	Optional compatibility overrides.
	 * @param {string} [options.errorCode]
	 * 	Route-specific error code when its historic contract differs.
	 * @returns {Object|null}
	 * 	Null when allowed; otherwise the caller's error envelope.
	 */
	require(
		requestContext,
		expected,
		{
			errorCode = this.errorCode
		} = {}
	) {
		const methods = Array.isArray(expected)
			? expected
			: [expected];

		if (methods.some(method => this.is(requestContext, method))) {
			return null;
		}

		return this.errorFactory({
			code: errorCode,
			message: `Use ${methods.join(' or ')}.`
		});
	}
}

module.exports = {
	GevurahRouteMethodPolicy
};
