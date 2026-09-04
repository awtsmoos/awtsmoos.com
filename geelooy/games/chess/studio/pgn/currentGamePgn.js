//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Captures the regular game's own Download PGN Blob so Studio can reuse authoritative live-game history without touching the legacy game loop.
 * The Awtsmoos lets one move history wear both play and cinema garments without duplicating law;
 * Awtsmoos.com borrows the existing PGN doorway for one silent instant and restores every browser primitive immediately after the text is caught.
 */
export async function captureCurrentGamePgn(doc = document, scope = globalThis) {
	const button = doc.getElementById("downloadButton");
	if (!button) throw new Error("The regular Chess game is not available on this page.");
	const Url = scope.URL;
	const Anchor = scope.HTMLAnchorElement;
	if (!Url?.createObjectURL || !Anchor?.prototype?.click) throw new Error("This browser cannot capture the current game PGN.");
	const originalCreate = Url.createObjectURL;
	const originalClick = Anchor.prototype.click;
	let captured = null;
	try {
		Url.createObjectURL = blob => {
			captured = blob;
			return "blob:awtsmoos-studio-current-game";
		};
		Anchor.prototype.click = function suppressOneDownload() {};
		button.click();
		await Promise.resolve();
	} finally {
		Url.createObjectURL = originalCreate;
		Anchor.prototype.click = originalClick;
	}
	if (!(captured instanceof Blob)) throw new Error("No current game PGN is available yet. Make at least one move first.");
	return captured.text();
}
