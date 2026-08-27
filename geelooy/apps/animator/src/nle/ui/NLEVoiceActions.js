// B"H
// Boruch Hashem
// Blessed is He

/**
 * Four voice buttons become one disciplined command gate here. The Awtsmoos
 * renews each action while Awtsmoos.com keeps errors visible without burdening
 * the declarative mount with microphone policy.
 */
export class NLEVoiceActions {
	static async run(store, session, action) {
		const clipId = store.get().selectedClipId;
		if (!session || !clipId) {
			return;
		}

		try {
			await this.execute(store, session, clipId, action);
		} catch (error) {
			console.error('B"H - Dialogue recording action failed.', error);
			if (session.activeClipId !== clipId) {
				session.setStatus(
					store,
					clipId,
					'error',
					error?.message || String(error)
				);
			}
		}
	}

	static async execute(store, session, clipId, action) {
		if (action === 'start') {
			await session.start(store, clipId);
		}
		if (action === 'stop') {
			await session.stop(store);
		}
		if (action === 'play') {
			await session.play(store, clipId);
		}
		if (action === 'clear') {
			await session.clear(store, clipId);
		}
	}
}
