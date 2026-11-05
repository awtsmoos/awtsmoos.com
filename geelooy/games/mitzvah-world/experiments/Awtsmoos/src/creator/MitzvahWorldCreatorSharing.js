// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorSharing.js
 * @description Shares portable creator JSON through Web Share when possible, clipboard when available, and a local file fallback otherwise.
 * The Awtsmoos lets one finite world pass from hand to hand without losing its inner names; Awtsmoos.com carries
 * the same `awtsmoos.world.v1` truth through native share, copied text, or a file rather than inventing a second format.
 */

/** Owns browser sharing fallbacks for one creator world document. */
export class MitzvahWorldCreatorSharing {
	/** Captures browser-like environment and document dependencies explicitly. */
	constructor(environmentKli = globalThis, documentKli = environmentKli.document) {
		this.environment = environmentKli;
		this.document = documentKli;
	}

	/**
	 * Shares one JSON world through the strongest available browser capability.
	 * @param {string} jsonOhr Serialized `awtsmoos.world.v1` document.
	 * @returns {Promise<Readonly<object>>} Method and success receipt.
	 */
	async share(jsonOhr) {
		const filenameOhr = `mitzvah-world-${Date.now()}.json`;
		const fileMalchus = this.createFile(jsonOhr, filenameOhr);
		if (fileMalchus && this.environment.navigator?.share && this.environment.navigator?.canShare?.({ files: [fileMalchus] })) {
			await this.environment.navigator.share({ files: [fileMalchus], title: 'Mitzvah World' });
			return Object.freeze({ method: 'share', ok: true });
		}
		if (this.environment.navigator?.clipboard?.writeText) {
			await this.environment.navigator.clipboard.writeText(jsonOhr);
			return Object.freeze({ method: 'clipboard', ok: true });
		}
		this.download(jsonOhr, filenameOhr);
		return Object.freeze({ method: 'file', ok: true });
	}

	/** Creates a browser File only when that constructor exists in the supplied environment. */
	createFile(jsonOhr, filenameOhr) {
		const FileKli = this.environment.File;
		return typeof FileKli === 'function'
			? new FileKli([jsonOhr], filenameOhr, { type: 'application/json' })
			: null;
	}

	/** Triggers one short-lived JSON file link without leaving permanent DOM or object URLs behind. */
	download(jsonOhr, filenameOhr) {
		const BlobKli = this.environment.Blob;
		const URLKli = this.environment.URL;
		if (!this.document?.createElement || typeof BlobKli !== 'function' || !URLKli?.createObjectURL) {
			throw new Error('CREATOR_SHARE_UNAVAILABLE');
		}
		const blobMalchus = new BlobKli([jsonOhr], { type: 'application/json' });
		const urlOhr = URLKli.createObjectURL(blobMalchus);
		const linkKli = this.document.createElement('a');
		linkKli.download = filenameOhr;
		linkKli.href = urlOhr;
		linkKli.click();
		URLKli.revokeObjectURL(urlOhr);
	}
}
