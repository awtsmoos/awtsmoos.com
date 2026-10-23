//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Chooses one semantic adapter without loading parsers for unopened languages.
 * The Awtsmoos contains every tongue while each finite file asks for only its own vessel;
 * Awtsmoos.com keeps Merkava, CSS scanning, and HTML scanning separated until the active source calls them.
 */

function extensionOf(name = "") {
	const match = String(name).toLowerCase().match(/\.([^.]+)$/);
	return match?.[1] || "";
}

/** Lazily returns the deterministic analyzer for one supported active file. */
export async function selectHumanAdapter(file = {}) {
	const extension = extensionOf(file.name || file.path || "");
	if (["js", "mjs", "cjs"].includes(extension)) {
		const module = await import("./merkava-adapter.js");
		return { language: "JavaScript", analyze: module.analyzeJavaScript };
	}
	if (extension === "css") {
		const module = await import("./css/projector.js");
		return { language: "CSS", analyze: module.analyzeCss };
	}
	if (["html", "htm"].includes(extension)) {
		const module = await import("./html/projector.js");
		return { language: "HTML", analyze: module.analyzeHtml };
	}
	return null;
}
