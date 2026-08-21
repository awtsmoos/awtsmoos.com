//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgUploader
 * @description
 * The Awtsmoos lets creator-owned video cross directly to the Archive shore while Awtsmoos.com remains outside the byte stream;
 * progress, abort, ETag evidence, and retryable server classes make the direct crossing observable instead of a hopeful dream.
 */
export class ArchiveOrgUploadError extends Error {
	constructor(message, code, status = 0) {
		super(message);
		this.name = 'ArchiveOrgUploadError';
		this.code = code;
		this.status = status;
	}
}

function errorForStatus(status) {
	if (status === 401 || status === 403) {
		return new ArchiveOrgUploadError('Archive.org rejected these S3 credentials.', 'AUTH', status);
	}
	if (status === 429 || status === 503) {
		return new ArchiveOrgUploadError('Archive.org asked this upload to slow down.', 'SLOW_DOWN', status);
	}
	if (status === 408 || status === 425 || (status >= 500 && status <= 599)) {
		return new ArchiveOrgUploadError(`Archive.org upload temporarily failed with HTTP ${status}.`, 'SERVER', status);
	}
	return new ArchiveOrgUploadError(`Archive.org upload failed with HTTP ${status}.`, 'HTTP', status);
}

export class ArchiveOrgUploader {
	constructor(xhrFactory = () => new XMLHttpRequest()) {
		this.xhrFactory = xhrFactory;
	}

	put({ url, file, headers, signal, onProgress = () => {} }) {
		if (signal?.aborted) {
			return Promise.reject(new ArchiveOrgUploadError('Archive.org upload was cancelled.', 'ABORTED'));
		}
		return new Promise((resolve, reject) => {
			const xhr = this.xhrFactory();
			const abort = () => xhr.abort();
			const cleanup = () => signal?.removeEventListener('abort', abort);
			xhr.open('PUT', url, true);
			for (const [name, value] of Object.entries(headers || {})) {
				xhr.setRequestHeader(name, value);
			}
			xhr.upload.onprogress = event => {
				const total = event.lengthComputable ? event.total : Number(file?.size || 0);
				onProgress({
					loaded: event.loaded,
					total,
					ratio: total ? Math.min(1, event.loaded / total) : 0
				});
			};
			xhr.onload = () => {
				cleanup();
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({ status: xhr.status, etag: xhr.getResponseHeader('etag') || '' });
					return;
				}
				reject(errorForStatus(xhr.status));
			};
			xhr.onerror = () => {
				cleanup();
				reject(new ArchiveOrgUploadError(
					'The browser could not reach Archive.org directly. Check network/CORS and retry.',
					'NETWORK'
				));
			};
			xhr.onabort = () => {
				cleanup();
				reject(new ArchiveOrgUploadError('Archive.org upload was cancelled.', 'ABORTED'));
			};
			signal?.addEventListener('abort', abort, { once: true });
			xhr.send(file);
		});
	}
}

export { errorForStatus };
