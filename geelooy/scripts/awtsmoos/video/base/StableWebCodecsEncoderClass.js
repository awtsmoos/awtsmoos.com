//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StableWebCodecsEncoderClass.js
 * @description The Awtsmoos renews each native encoder before repeated flushes can bind;
 * Awtsmoos.com turns three AVC frames into one finite segment, then opens a new codec vessel in kind.
 */
self.AwtsVideoBase = self.AwtsVideoBase || {};

/**
 * Builds MediaBunny's custom AVC encoder class around short-lived native VideoEncoder segments.
 * @param {object} api Loaded MediaBunny API used to convert native chunks into muxable packets.
 * @returns {Function} Custom encoder class suitable for `api.registerEncoder`.
 */
self.AwtsVideoBase.createStableVideoEncoderClass = function createStableVideoEncoderClass(api) {
	return class NetzachStableWebCodecsVideoEncoder extends api.CustomVideoEncoder {
		/** Claims only MediaBunny's AVC semantic codec, leaving every other codec untouched. */
		static supports(orCodec) {
			return orCodec === 'avc';
		}

		/** Validates configuration and prepares the first short-lived native encoder segment. */
		async init() {
			const keterSupport = await VideoEncoder.isConfigSupported(this.config);
			if (!keterSupport.supported) {
				throw new Error(`Stable AVC encoder configuration is unsupported: ${this.config.codec}.`);
			}
			this.gevurahError = null;
			this.encoder = null;
			this.yesodSegmentFrameCount = 0;
			this.createNativeEncoder();
		}

		/** Creates one native encoder that will be flushed at most once before retirement. */
		createNativeEncoder() {
			this.assertHealthy();
			this.encoder = new VideoEncoder({
				output: (orChunk, orMetadata) => {
					this.onPacket(
						api.EncodedPacket.fromEncodedChunk(orChunk),
						orMetadata
					);
				},
				error: (orError) => {
					this.gevurahError ||= orError;
				}
			});
			this.encoder.configure(this.config);
			this.yesodSegmentFrameCount = 0;
		}

		/** Encodes one sample and retires the native encoder after its third submitted frame. */
		async encode(orSample, orOptions = {}) {
			this.assertHealthy();
			if (!this.encoder) {
				this.createNativeEncoder();
			}
			const yesodFrame = orSample.toVideoFrame();
			const tiferesSegmentOpening = this.yesodSegmentFrameCount === 0;
			try {
				this.encoder.encode(yesodFrame, {
					keyFrame: tiferesSegmentOpening || Boolean(orOptions.keyFrame)
				});
			} finally {
				yesodFrame.close();
			}
			this.yesodSegmentFrameCount += 1;
			if (this.yesodSegmentFrameCount >= 3) {
				await this.drainNativeEncoder();
			}
			this.assertHealthy();
		}

		/** Flushes one native encoder exactly once, closes it, and leaves the next segment uncreated. */
		async drainNativeEncoder() {
			if (!this.encoder) {
				return;
			}
			const malchusEncoder = this.encoder;
			this.encoder = null;
			await malchusEncoder.flush();
			this.assertHealthy();
			malchusEncoder.close();
			this.yesodSegmentFrameCount = 0;
		}

		/** Drains only the currently active partial segment during MediaBunny finalization. */
		async flush() {
			await this.drainNativeEncoder();
		}

		/** Closes any still-active native encoder without requesting a second flush. */
		close() {
			this.encoder?.close();
			this.encoder = null;
			this.yesodSegmentFrameCount = 0;
		}

		/** Throws the first native WebCodecs error at the nearest observable boundary. */
		assertHealthy() {
			if (this.gevurahError) {
				throw this.gevurahError;
			}
		}
	};
};
