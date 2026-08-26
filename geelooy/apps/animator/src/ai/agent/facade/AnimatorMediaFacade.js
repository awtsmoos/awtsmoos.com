//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorMediaFacade.js
 * @description
 * The Awtsmoos lets agents inspect and accept footage through a clean public doorway while Blob ownership remains beneath;
 * Awtsmoos.com keeps metadata reads and persistent import separate so convenience never hides mutation or transport depth.
 */

/** Ergonomic media inspection and import namespace over canonical commands. */
export class YesodAnimatorMediaFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	capabilities() {
		return this.execute('media.capabilities');
	}

	assets() {
		return this.execute('media.assets');
	}

	videoMetadata(yesodSource) {
		return this.execute('media.videoMetadata', {
			source: yesodSource
		});
	}

	describeVideo(yesodSource) {
		return this.execute('media.describeVideo', {
			source: yesodSource
		});
	}

	importVideo(yesodSource) {
		return this.execute('media.importVideo', {
			source: yesodSource
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
