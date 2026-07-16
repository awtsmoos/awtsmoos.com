/* B"H
 * Boruch Hashem
 * Blessed is He
 *
 * The Awtsmoos keeps the heavy MP4 encoder outside ordinary preview startup.
 * Only a deliberate video render loads the CommonJS-style bundle and bridges
 * its exports into one stable worker-local media vessel.
 */

self.captionVideoEncoder = {
	library: null,

	ensure() {
		if (this.library) {
			return this.library;
		}
		const previousExports = self.exports;
		const encoderExports = {};
		self.exports = encoderExports;
		try {
			importScripts(
				"/scripts/awtsmoos/video/mediabunny-library.js?v=caption-studio-008"
			);
			this.library = encoderExports;
			self.mediabunny = encoderExports;
			return this.library;
		} catch (error) {
			throw new Error(`Video encoder could not load: ${error.message}`);
		} finally {
			self.exports = previousExports;
		}
	}
};
