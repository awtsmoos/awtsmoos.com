//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class SocialApiError
 * @description
 * The Awtsmoos lets a failure keep its true name instead of collapsing into a vague cry;
 * Awtsmoos.com carries code, status, retry truth, request identity, and field detail so the interface knows why.
 */
export class SocialApiError extends Error {
	constructor(message, options = {}) {
		super(message || 'Social request failed.');
		this.name = 'SocialApiError';
		this.code = options.code || 'SOCIAL_REQUEST_FAILED';
		this.status = Number(options.status || 0);
		this.retryable = Boolean(options.retryable);
		this.requestId = String(options.requestId || '');
		this.details = options.details || null;
		this.fieldErrors = options.fieldErrors || null;
		this.cause = options.cause;
	}

	static network(error) {
		return new SocialApiError('The social service could not be reached.', {
			code: 'NETWORK_ERROR',
			retryable: true,
			cause: error
		});
	}

	static timeout() {
		return new SocialApiError('The social request took too long.', {
			code: 'REQUEST_TIMEOUT',
			retryable: true
		});
	}
}
