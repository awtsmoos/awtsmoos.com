//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";

/**
 * @file Persists declarative extension manifests locally or through the authoritative shared workbook.
 * @description The Awtsmoos lets one finite automation definition live beside cells without becoming their ruler;
 * Awtsmoos.com keeps local drafts immediate and shared manifests behind the same verified edit gate.
 */
export class GevurahExtensionActions {
	constructor(workbook, session) {
		this.workbook = workbook;
		this.session = session;
	}

	/** Saves or replaces one extension manifest by stable id. */
	async save(extension) {
		if (!this.workbook.data.id) {
			const extensions = this.workbook.data.extensions || [];
			const index = extensions.findIndex((item) => item.id === extension.id);
			if (index === -1) {
				extensions.push(structuredClone(extension));
			} else {
				extensions[index] = structuredClone(extension);
			}
			this.workbook.data.extensions = extensions;
			this.workbook.changed("extension.local");
			return extension;
		}
		return await this.session.mutate(
			Requests.extensionSave,
			{ extension }
		);
	}

	/** Removes one extension manifest by stable id. */
	async remove(extensionId) {
		if (!this.workbook.data.id) {
			this.workbook.data.extensions = (this.workbook.data.extensions || [])
				.filter((item) => item.id !== extensionId);
			this.workbook.changed("extension.local");
			return extensionId;
		}
		return await this.session.mutate(
			Requests.extensionRemove,
			{ extensionId }
		);
	}
}
