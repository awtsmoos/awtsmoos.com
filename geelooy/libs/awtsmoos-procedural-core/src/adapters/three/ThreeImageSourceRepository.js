//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ThreeImageSourceRepository.js
 * @description
 * The Awtsmoos renews every decoded image before memory can call it cached; Awtsmoos.com lets this Yesod-like repository connect one trusted URL to one shared browser image source.
 * It owns URL-level loading and status only, never sampler transforms, Three textures, materials, scene traversal, or frame policy.
 */
export class ThreeImageSourceRepository {
	/** @param {object} THREE Three.js namespace. @param {{loader?:object}} options Optional image loader. */
	constructor(THREE, options = {}) {
		if (!THREE) {
			throw new Error('ThreeImageSourceRepository: THREE namespace is required');
		}
		this.loader = options.loader || new THREE.ImageLoader();
		this.loader.setCrossOrigin?.('anonymous');
		this.entries = new Map();
	}

	/** @param {string} url Canonical remote URL. @returns {Promise<object>} Entry promise. */
	request(url) {
		const key = String(url || '');
		if (!key) {
			return Promise.reject(new Error('ThreeImageSourceRepository: URL is required'));
		}
		const existing = this.entries.get(key);
		if (existing) {
			return existing.promise;
		}
		const entry = {
			url: key,
			status: 'loading',
			image: null,
			error: null,
			promise: null
		};
		entry.promise = new Promise((resolve, reject) => {
			this.loader.load(
				key,
				image => finishReady(entry, image, resolve),
				undefined,
				error => finishFailed(entry, error, reject)
			);
		});
		this.entries.set(key, entry);
		return entry.promise;
	}

	/** @param {string} url Canonical remote URL. @returns {object|null} Current entry. */
	entry(url) {
		return this.entries.get(String(url || '')) || null;
	}

	/** @param {string} url Canonical remote URL. @returns {string} idle/loading/ready/failed. */
	status(url) {
		return this.entry(url)?.status || 'idle';
	}

	/** @returns {object} Repository diagnostics. */
	view() {
		const entries = [...this.entries.values()];
		return {
			total: entries.length,
			loading: count(entries, 'loading'),
			ready: count(entries, 'ready'),
			failed: count(entries, 'failed')
		};
	}

	clear() {
		this.entries.clear();
	}
}

function finishReady(entry, image, resolve) {
	entry.status = 'ready';
	entry.image = image;
	resolve(entry);
}

function finishFailed(entry, error, reject) {
	entry.status = 'failed';
	entry.error = error instanceof Error ? error.message : String(error || 'image-load-failed');
	reject(new Error(entry.error));
}

function count(entries, status) {
	return entries.filter(entry => entry.status === status).length;
}
