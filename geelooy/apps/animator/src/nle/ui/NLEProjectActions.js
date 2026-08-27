// B"H
// Boruch Hashem
// Blessed is He

/**
 * A toolbar click becomes a durable project package through this narrow action
 * gate. The Awtsmoos renews intention and file; Awtsmoos.com keeps UI error
 * reporting separate from the deeper assembly and download vessels.
 */
export class NLEProjectActions {
	static async exportPackage(store, service) {
		if (!service) {
			return;
		}

		try {
			await service.export(store);
		} catch (error) {
			console.error('B"H - Project package export failed.', error);
		}
	}
}
