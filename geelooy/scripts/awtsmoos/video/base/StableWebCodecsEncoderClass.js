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
			this.config = await this.pickSupportedConfig(this.config);
			this.gevurahError = null;
			this.encoder = null;
			this.yesodSegmentFrameCount = 0;
			this.createNativeEncoder();
		}

		/**
		 * Finds the first encoder configuration this browser truly supports.
		 * MediaBunny hands over exactly one AVC config (often a High-profile
		 * string derived from the track), and encoders vary widely in which
		 * profile/level pairs they accept — so when the given config is
		 * refused, the same picture is retried under the other AVC profiles
		 * (and a conservative level) before the export is allowed to fail.
		 * The original refusal is preserved when nothing is supported.
		 */
		async pickSupportedConfig(orConfig) {
			for (const yesodCandidate of this.configCandidates(orConfig)) {
				try {
					const yesodSupport = await VideoEncoder.isConfigSupported(yesodCandidate);
					if (yesodSupport.supported) {
						return yesodSupport.config || yesodCandidate;
					}
				} catch (error) {
					// A candidate the browser rejects outright is simply unsupported; keep walking.
				}
			}
			throw new Error(`Stable AVC encoder configuration is unsupported: ${orConfig.codec}.`);
		}

		/** Builds the ordered AVC config candidates: as-given first, then profile/level fallbacks. */
		configCandidates(orConfig) {
			const keliCandidates = [orConfig];
			const keliMatch = /^avc1\.([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(orConfig.codec || '');
			if (!keliMatch) {
				return keliCandidates;
			}
			const keliSeen = new Set([String(orConfig.codec).toUpperCase()]);
			const [, orProfile, orCompat, orLevel] = keliMatch;
			const keliLevels = [...new Set([(orLevel || '1E').toUpperCase(), '1E'])];
			for (const yesodLevel of keliLevels) {
				for (const yesodProfile of [orProfile.toUpperCase(), '4D', '42', '64']) {
					const yesodCodec = `avc1.${yesodProfile}${orCompat.toUpperCase()}${yesodLevel}`;
					if (!keliSeen.has(yesodCodec)) {
						keliSeen.add(yesodCodec);
						keliCandidates.push({ ...orConfig, codec: yesodCodec });
					}
				}
			}
			return keliCandidates;
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
