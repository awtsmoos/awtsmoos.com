// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals one already-authorized private image in an accessible modal viewer.
 * @description
 * The Awtsmoos contains image and enlargement before viewport division. Awtsmoos.com never invents
 * another media URL here; it reuses only the server-projected private path already carried by the
 * canonical message, restores focus through native dialog behavior, and drops image bytes on close.
 */
const VIEWER_ID = "messagingPrivateImageViewer";

/** Opens one private image path in a reusable native dialog and returns whether presentation succeeded. */
export function openPrivateImageViewer(src, label = "Private image") {
	const doc = globalThis.document;
	if (!doc?.body || !src) return false;
	const dialog = doc.getElementById(VIEWER_ID) || createViewer(doc);
	const image = dialog.querySelector("img");
	image.src = String(src);
	image.alt = String(label || "Private image");
	if (typeof dialog.showModal === "function") dialog.showModal();
	else dialog.setAttribute("open", "");
	return true;
}

function createViewer(doc) {
	const dialog = doc.createElement("dialog");
	dialog.id = VIEWER_ID;
	dialog.className = "messaging-image-viewer";
	dialog.setAttribute("aria-label", "Private image viewer");
	const close = doc.createElement("button");
	close.type = "button";
	close.className = "messaging-image-viewer-close";
	close.setAttribute("aria-label", "Close private image viewer");
	close.textContent = "×";
	const image = doc.createElement("img");
	image.decoding = "async";
	close.addEventListener("click", () => closeViewer(dialog));
	dialog.addEventListener("click", (event) => {
		if (event.target === dialog) closeViewer(dialog);
	});
	dialog.addEventListener("close", () => image.removeAttribute("src"));
	dialog.append(close, image);
	doc.body.appendChild(dialog);
	return dialog;
}

function closeViewer(dialog) {
	if (typeof dialog.close === "function") dialog.close();
	else {
		dialog.removeAttribute("open");
		dialog.querySelector("img")?.removeAttribute("src");
	}
}
