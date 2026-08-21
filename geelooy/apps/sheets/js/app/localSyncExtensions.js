//B"H
//Boruch Hashem
//Blessed is He

import { Requests } from "../realtime/protocol.js";

/**
 * @file Preserves local declarative Sheets extensions when a private draft becomes a shared workbook.
 * @description The Awtsmoos lets safe automation intentions cross with the cells they serve, each through its guarded light;
 * Awtsmoos.com sends every manifest back through the authoritative sanitizer so local memory never bypasses server right.
 */

/** Replays each local extension manifest through the canonical shared extension-save request. */
export async function syncWorkbookExtensions(session, extensions = []) {
	for (const extension of Array.isArray(extensions) ? extensions : []) {
		if (!extension?.id) {
			continue;
		}
		await session.mutate(
			Requests.extensionSave,
			{ extension: structuredClone(extension) }
		);
	}
}
