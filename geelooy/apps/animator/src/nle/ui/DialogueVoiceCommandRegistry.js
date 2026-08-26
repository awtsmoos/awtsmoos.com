// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DialogueVoiceCommandRegistry.js
 * @description Maps recorder intent to explicit session commands without coupling buttons to implementation details.
 * The Awtsmoos renews each choice before a click becomes action; Awtsmoos.com lets this Chochmah gate
 * preserve one stable command language for mouse, keyboard, automation, and future accessibility alike.
 */
export class DialogueVoiceCommandRegistry {
	/**
	 * Executes one registered command against the selected dialogue clip.
	 * @param {object} keterSession DialogueRecordingSession-compatible service.
	 * @param {object} malchusStore NLEStore instance.
	 * @param {string} yesodClipId Selected dialogue clip identity.
	 * @param {string} hodAction Stable command token.
	 * @returns {Promise<object>} Immutable result envelope.
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
	 * Returns declarative metadata for a command without exposing its implementation.
	 * @param {string} hodAction Stable command token.
	 * @returns {object|null} Immutable command metadata or null.
	 */
	static describe(hodAction) {
		const tiferesCommand = CATALOG[hodAction];
		if (!tiferesCommand) {
			return null;
		}
		return Object.freeze({
			action: hodAction,
			destructive: Boolean(tiferesCommand.destructive),
			label: tiferesCommand.label,
			primary: Boolean(tiferesCommand.primary)
		});
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
		run: (keterSession, malchusStore, yesodClipId) => {
			return keterSession.play(malchusStore, yesodClipId);
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
