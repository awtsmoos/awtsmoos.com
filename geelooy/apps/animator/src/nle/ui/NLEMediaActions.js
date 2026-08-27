// B"H
// Boruch Hashem
// Blessed is He

/**
 * The file input chooses a vessel; this command gate carries it into durable
 * media orchestration. The Awtsmoos renews the footage while Awtsmoos.com keeps
 * the UI event small, resettable, and honest about failures.
 */
export class NLEMediaActions {
	static async importVideo(store, service, event) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!service || !file) {
			return;
		}

		try {
			await service.importFile(store, file);
		} catch (error) {
			console.error('B"H - Real video import failed.', error);
		} finally {
			input.value = '';
		}
	}
}
