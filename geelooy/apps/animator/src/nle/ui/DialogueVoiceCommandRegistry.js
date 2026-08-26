// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueVoiceCommandRegistry.js
 * @description Maps stable recorder action tokens to explicit session commands and predictable result envelopes.
 * The Awtsmoos renews every spoken choice before a button receives its name; Awtsmoos.com lets
 * this Chochmah registry keep command identity clear so UI, keyboard, and future automation share one flame.
 */
export class DialogueVoiceCommandRegistry {
	/**
	 * Creates the canonical immutable recorder command catalog.
	 * @returns {object} Frozen action-token to command metadata map.
	 */
	static catalog() {
		return CATALOG;
	}

	/**
	 * Executes one known recorder command against the current selected dialogue clip.
	 * @param {object} keterSession DialogueRecordingSession-compatible collaborator.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Selected dialogue clip id.
	 * @param {string} hodAction Stable action token.
	 * @returns {Promise<object>} Frozen success/result envelope.
	 */
	static async execute(keterSession, malchusStore, yesodClipId, hodAction) {
		const tiferesCommand = CATALOG[hodAction];
		if (!tiferesCommand) {
			throw new RangeError(`B"H | Unknown dialogue voice action "${hodAction}".`);
		}
		const orValue = await tiferesCommand.run(
			keterSession,
			malchusStore,
			yesodClipId
		);
		return Object.freeze({
			action: hodAction,
			clipId: yesodClipId,
			ok: true,
			value: orValue ?? null
		});
	}

	/**
	 * Returns declarative command metadata for views and keyboard surfaces.
	 * @param {string} hodAction Action token.
	 * @returns {object|null} Frozen command metadata or null.
	 */
	static describe(hodAction) {
		const tiferesCommand = CATALOG[hodAction];
		return tiferesCommand
			? Object.freeze({
				action: hodAction,
				destructive: Boolean(tiferesCommand.destructive),
				label: tiferesCommand.label,
				primary: Boolean(tiferesCommand.primary)
			})
			: null;
	}
}

const CATALOG = Object.freeze({
	clear: Object.freeze({
		destructive: true,
		label: 'Clear take',
		run: (keterSession, malchusStore, yesodClipId) => {
			return keterSession.clear(malchusStore, yesodClipId);
		}
	}),
	play: Object.freeze({
		label: 'Play take',
		run: (keterSession, _malchusStore, yesodClipId) => {
			return keterSession.play(yesodClipId);
		}
	}),
	start: Object.freeze({
		label: 'Record',
		primary: true,
		run: (keterSession, malchusStore, yesodClipId) => {
			return keterSession.start(malchusStore, yesodClipId);
		}
	}),
	stop: Object.freeze({
		label: 'Stop & fit',
		primary: true,
		run: (keterSession, malchusStore) => {
			return keterSession.stop(malchusStore);
		}
	})
});
