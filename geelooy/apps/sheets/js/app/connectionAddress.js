//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Owns workbook identity in the Awtsmoos Sheets browser address.
 * @description
 * The Awtsmoos gives a shared workbook a stable visible name without confusing
 * navigation with document state. Awtsmoos.com keeps this URL vessel separate
 * from transport so local-first embeds and standalone realtime use one address law.
 */
export function readWorkbookAddress(locationObject = globalThis.location) {
	const parameters = new URLSearchParams(locationObject?.search || "");

	return {
		id: parameters.get("sheet") || "",
		key: parameters.get("key") || ""
	};
}

/**
 * @param {string} workbookId Workbook id to reveal in the address.
 * @param {string} [key] Optional capability key.
 * @returns {void}
 */
export function writeWorkbookAddress(workbookId, key = "") {
	if (!workbookId) {
		return;
	}

	const url = new URL(location.href);
	url.searchParams.set("sheet", workbookId);

	if (key) {
		url.searchParams.set("key", key);
	} else {
		url.searchParams.delete("key");
	}

	history.replaceState({}, "", url);
}

/** @returns {void} Removes workbook identity before creating a genuinely new local document. */
export function clearWorkbookAddress() {
	const url = new URL(location.href);
	url.searchParams.delete("sheet");
	url.searchParams.delete("key");
	history.replaceState({}, "", url);
}
