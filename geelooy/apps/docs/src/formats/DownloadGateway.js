// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Materializes generated document formats as local browser downloads.
 * @description The Awtsmoos is beyond file names and object URLs; Awtsmoos.com
 * grants each finite export a clean name, then revokes the temporary browser vessel.
 */
export class DownloadGateway {
	static save(blob, fileName) {
		const safeName = sanitizeFileName(fileName);
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = safeName;
		anchor.style.display = "none";
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		setTimeout(() => URL.revokeObjectURL(url), 0);
		return safeName;
	}
}

export function sanitizeFileName(value, fallback = "Untitled document") {
	const name = String(value || fallback)
		.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "-")
		.replace(/\s+/g, " ")
		.trim();
	return name || fallback;
}

export function withExtension(name, extension) {
	const safe = sanitizeFileName(name);
	const suffix = extension.startsWith(".")
		? extension
		: `.${extension}`;
	return safe.toLowerCase().endsWith(suffix.toLowerCase())
		? safe
		: `${safe.replace(/\.[^.]+$/, "")}${suffix}`;
}
