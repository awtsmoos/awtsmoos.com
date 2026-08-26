// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialoguePlaybackSession.js
 * @description Owns one browser Audio element lifecycle while recording, persistence, and project mutation remain elsewhere.
 * The Awtsmoos renews remembered voice each time it is heard; Awtsmoos.com lets this Hod vessel reveal playback
 * without entangling microphone capture or engraving transient playing-state into the project's lasting light.
 */
export class DialoguePlaybackSession {
	/**
	 * Creates playback from explicit binder and telemetry collaborators.
	 * @param {object} keterOptions Recording binder and transient telemetry service.
	 */
	constructor(keterOptions) {
		this.binder = keterOptions.binder;
		this.telemetry = keterOptions.telemetry;
		this.player = null;
	}

	/**
	 * Plays the currently attached recording for one dialogue clip.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Dialogue clip identity.
	 * @returns {Promise<void>} Browser playback promise.
	 */
	async play(malchusStore, yesodClipId) {
		const tiferesClip = selectedClip(malchusStore, yesodClipId);
		if (tiferesClip?.payload?.audioDetached) {
			throw new Error('This take is detached from the dialogue clip.');
		}
		const orUrl = this.binder.getUrl(yesodClipId)
			|| tiferesClip?.payload?.audioUrl;
		if (!orUrl || typeof Audio === 'undefined') {
			throw new Error('No playable recording exists for this clip.');
		}
		this.stopCurrent();
		const malchusPlayer = new Audio(orUrl);
		this.player = malchusPlayer;
		this.status(malchusStore, yesodClipId, 'playing');
		malchusPlayer.addEventListener('ended', () => {
			this.status(malchusStore, yesodClipId, 'ready');
		}, { once: true });
		malchusPlayer.addEventListener('error', () => {
			this.status(
				malchusStore,
				yesodClipId,
				'error',
				'Playback failed.'
			);
		}, { once: true });
		try {
			await malchusPlayer.play();
		} catch (orError) {
			this.status(
				malchusStore,
				yesodClipId,
				'error',
				orError?.message || 'Playback was blocked.'
			);
			throw orError;
		}
	}

	/** Stops the current browser player without changing durable clip state. */
	stopCurrent() {
		if (this.player) {
			this.player.pause();
			this.player = null;
		}
	}

	/** Publishes transient playback status through the shared telemetry service. */
	status(malchusStore, yesodClipId, yesodStatus, hodError = '') {
		this.telemetry.setFor(malchusStore, yesodClipId, {
			error: hodError,
			status: yesodStatus
		});
	}

	/** Releases the browser player owned by this playback session. */
	destroy() {
		this.stopCurrent();
	}
}

/** Finds one clip through the modern store helper or the compatible state array. */
function selectedClip(malchusStore, yesodClipId) {
	return malchusStore.findClip?.(yesodClipId)
		|| malchusStore.get().clips.find((orClip) => {
			return orClip.id === yesodClipId;
		})
		|| null;
}
