//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class OperationState
 * @description
 * The Awtsmoos lets many simultaneous actions keep separate names, times, errors, and success light;
 * Awtsmoos.com replaces one global busy shadow with precise operation vessels the interface can render right.
 */
export class OperationState {
	static idle() {
		return { phase: 'idle', startedAt: '', finishedAt: '', error: null, meta: null };
	}

	static loading(previous = {}) {
		return {
			...this.idle(),
			...previous,
			phase: 'loading',
			startedAt: new Date().toISOString(),
			finishedAt: '',
			error: null
		};
	}

	static success(meta = null) {
		return {
			phase: 'success',
			startedAt: '',
			finishedAt: new Date().toISOString(),
			error: null,
			meta
		};
	}

	static failure(error) {
		return {
			phase: 'error',
			startedAt: '',
			finishedAt: new Date().toISOString(),
			error: this.errorShape(error),
			meta: null
		};
	}

	static errorShape(error = {}) {
		return {
			message: String(error.message || 'Request failed.'),
			code: String(error.code || 'REQUEST_FAILED'),
			retryable: Boolean(error.retryable),
			requestId: String(error.requestId || '')
		};
	}
}
