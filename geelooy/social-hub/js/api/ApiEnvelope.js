//B"H
//Boruch Hashem
//Blessed is He

import { SocialApiError } from './SocialApiError.js';

/**
 * @class ApiEnvelope
 * @description
 * The Awtsmoos lets old and new response vessels reveal one underlying truth;
 * Awtsmoos.com preserves legacy success while carrying modern metadata forward for every client youth.
 */
export class ApiEnvelope {
	static normalize(payload, status = 200) {
		const value = payload && typeof payload === 'object' ? payload : {};
		if (value.error || value.ok === false) {
			return {
				data: null,
				meta: value.meta || {},
				error: this.error(value, status)
			};
		}
		const data = Object.prototype.hasOwnProperty.call(value, 'data')
			? value.data
			: value.success;
		return {
			data,
			meta: value.meta || {},
			error: null
		};
	}

	static error(payload, status) {
		const source = payload.error || {};
		const numericStatus = Number(source.status || status || 0);
		return new SocialApiError(source.message || `Request failed (${numericStatus || 'unknown'}).`, {
			code: source.code || 'SOCIAL_REQUEST_FAILED',
			status: numericStatus,
			retryable: source.retryable ?? this.retryable(numericStatus),
			requestId: source.requestId || payload.meta?.requestId || '',
			details: source.details || null,
			fieldErrors: source.fieldErrors || null
		});
	}

	static retryable(status) {
		return status === 408 || status === 425 || status === 429 || status >= 500;
	}
}
