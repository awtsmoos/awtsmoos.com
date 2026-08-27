//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every spoken letter a portable vessel. Awtsmoos.com may
 * reveal a message as text, a native share sheet, or a downloaded media file;
 * this module keeps those crossings small, explicit, and recoverable.
 */
export async function copyMessageText(text) {
	const value = requireText(text);
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(value);
		return;
	}
	fallbackCopy(value);
}

export async function shareMessageText(text, title = "Awtsmoos AI message") {
	const value = requireText(text);
	if (navigator.share) {
		await navigator.share({ title, text: value });
		return "shared";
	}
	await copyMessageText(value);
	return "copied";
}

export function downloadMessageText(text, filename = "awtsmoos-message.txt") {
	const value = requireText(text);
	downloadBlob(new Blob([value], { type: "text/plain;charset=utf-8" }), filename);
}

export async function downloadRemoteMedia(url, filename) {
	const source = String(url || "").trim();
	if (!source) {
		throw new Error("No downloadable media source was found.");
	}
	if (/^(blob:|data:)/i.test(source)) {
		triggerDownload(source, filename);
		return;
	}
	try {
		const response = await fetch(source, { credentials: "include" });
		if (!response.ok) {
			throw new Error(`Media request failed with ${response.status}.`);
		}
		downloadBlob(await response.blob(), filename);
	} catch (error) {
		triggerDownload(source, filename, true);
		console.warn("Direct media fetch failed; browser fallback used.", error);
	}
}

export function sanitizeDownloadName(name, fallback = "awtsmoos-download") {
	const clean = String(name || "")
		.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 120);
	return clean || fallback;
}

function requireText(text) {
	const value = String(text || "").trim();
	if (!value) {
		throw new Error("This message has no text to transfer.");
	}
	return value;
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	triggerDownload(url, filename);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function triggerDownload(url, filename, openFallback = false) {
	const link = document.createElement("a");
	link.href = url;
	link.download = sanitizeDownloadName(filename);
	if (openFallback) {
		link.target = "_blank";
		link.rel = "noopener noreferrer";
	}
	document.body.append(link);
	link.click();
	link.remove();
}

function fallbackCopy(text) {
	const area = document.createElement("textarea");
	area.value = text;
	area.readOnly = true;
	area.style.position = "fixed";
	area.style.opacity = "0";
	document.body.append(area);
	area.select();
	const copied = document.execCommand("copy");
	area.remove();
	if (!copied) {
		throw new Error("Clipboard access is unavailable.");
	}
}
