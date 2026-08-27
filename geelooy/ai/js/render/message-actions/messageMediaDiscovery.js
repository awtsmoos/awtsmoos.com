//B"H
// Boruch Hashem
// Blessed is He

import { sanitizeDownloadName } from "./messageActionTransfer.js";

/**
 * A rendered message is a garden of possible vessels. The Awtsmoos lets this
 * module inspect visible audio and video paths so Awtsmoos.com never invents a
 * download that the message does not actually contain.
 */
export function discoverMessageMedia(shell) {
	if (!shell?.querySelectorAll) {
		return [];
	}
	const found = [];
	const seen = new Set();
	for (const node of shell.querySelectorAll("audio[src], video[src], source[src], a[href]")) {
		const url = mediaUrl(node);
		const kind = classifyMediaSource({
			url,
			type: node.getAttribute?.("type"),
			tagName: mediaTagName(node)
		});
		const key = `${kind}:${url}`;
		if (!kind || !isDownloadableUrl(url) || seen.has(key)) {
			continue;
		}
		seen.add(key);
		found.push({ kind, url, filename: mediaFilename(url, kind) });
	}
	return found;
}

export function classifyMediaSource({ url = "", type = "", tagName = "" } = {}) {
	const mime = String(type || "").toLowerCase();
	const tag = String(tagName || "").toLowerCase();
	if (mime.startsWith("audio/") || tag === "audio") {
		return "audio";
	}
	if (mime.startsWith("video/") || tag === "video") {
		return "video";
	}
	const path = safePathname(url).toLowerCase();
	if (/\.(mp3|m4a|aac|wav|ogg|oga|flac|opus)$/.test(path)) {
		return "audio";
	}
	if (/\.(mp4|webm|mov|m4v|ogv|mpeg)$/.test(path)) {
		return "video";
	}
	return null;
}

export function mediaFilename(url, kind) {
	const extension = kind === "audio" ? "mp3" : "mp4";
	const fallback = `awtsmoos-message-${kind}.${extension}`;
	const encoded = safePathname(url).split("/").pop() || "";
	return sanitizeDownloadName(safeDecode(encoded), fallback);
}

function mediaUrl(node) {
	return String(node.currentSrc || node.src || node.href || node.getAttribute?.("src") || node.getAttribute?.("href") || "").trim();
}

function mediaTagName(node) {
	const ownTag = String(node.tagName || "").toLowerCase();
	return ownTag === "source"
		? String(node.parentElement?.tagName || "").toLowerCase()
		: ownTag;
}

function isDownloadableUrl(url) {
	return /^(https?:|blob:|data:)/i.test(String(url || ""));
}

function safePathname(url) {
	try {
		return new URL(String(url || ""), "https://awtsmoos.com").pathname;
	} catch {
		return String(url || "");
	}
}

function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}
