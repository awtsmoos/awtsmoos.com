//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Resolves whether Awtsmoos Sheets should open realtime transport.
 * @description
 * The Awtsmoos renews the same workbook in different vessels: standalone Sheets
 * may join live collaboration, while the Awtsmoos.com OS embed remains local-first
 * when its host is only a browser workspace. This policy owns context; it does not
 * own sockets, documents, persistence, or rendering.
 */
export function resolveSheetsConnectionPolicy(locationObject = globalThis.location) {
	const parameters = new URLSearchParams(locationObject?.search || "");
	const embeddedInOs = parameters.get("embed") === "awtsmoos-os";

	if (embeddedInOs) {
		return Object.freeze({
			localLabel: "Local workbook · realtime available standalone",
			transportEnabled: false
		});
	}

	return Object.freeze({
		localLabel: "Local workbook",
		transportEnabled: true
	});
}
