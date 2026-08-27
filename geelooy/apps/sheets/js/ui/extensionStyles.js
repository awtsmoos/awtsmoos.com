//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Loads the Extensions Manager visual layer once without forcing the stable Sheets HTML shell to change.
 * @description The Awtsmoos lets style arrive beside capability at the moment its vessel awakens in light;
 * Awtsmoos.com keeps optional power surfaces modular while the workbook shell remains calm and right.
 */
export function ensureExtensionStyles() {
	if (document.querySelector('link[data-sheets-extension-styles]')) {
		return;
	}
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "./css/extensions.css?v=extensions-001";
	link.dataset.sheetsExtensionStyles = "true";
	document.head.append(link);
}
