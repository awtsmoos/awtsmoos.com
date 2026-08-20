// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Carries one bounded file-opening intention between same-origin Awtsmoos apps.
 * @description The Awtsmoos is beyond application boundaries; Awtsmoos.com lets a
 * finite file ask for another view without publishing it or confusing the file with the editor.
 */
export const FILE_INTENT_VERSION = 1;
const STORAGE_PREFIX = "awtsmoos.file-intent";
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024;
const MAX_AGE_MS = 10 * 60 * 1000;

export function publishFileIntent(intent, targetPath) {
	const normalized = normalizeFileIntent(intent);
	const id = crypto.randomUUID();
	sessionStorage.setItem(
		`${STORAGE_PREFIX}:${id}`,
		JSON.stringify(normalized)
	);
	const url = new URL(targetPath, location.origin);
	url.searchParams.set("fileIntent", id);
	return url.href;
}

export function consumeFileIntent(locationValue = location.href) {
	const url = new URL(locationValue, location.origin);
	const id = url.searchParams.get("fileIntent") || "";
	if (!id) return null;
	const key = `${STORAGE_PREFIX}:${id}`;
	const raw = sessionStorage.getItem(key);
	sessionStorage.removeItem(key);
	if (!raw) return null;
	const parsed = JSON.parse(raw);
	if (!Number.isFinite(parsed.createdAt) || Date.now() - parsed.createdAt > MAX_AGE_MS) {
		throw new Error("File-open intent expired");
	}
	return normalizeFileIntent(parsed);
}

export function normalizeFileIntent(intent = {}) {
	const content = String(intent.content || "");
	if (content.length > MAX_CONTENT_LENGTH) {
		throw new Error("File is too large for an in-browser cross-app handoff");
	}
	return {
		version: FILE_INTENT_VERSION,
		createdAt: Number(intent.createdAt) || Date.now(),
		fileName: bounded(intent.fileName, 240, "Untitled"),
		path: bounded(intent.path, 1024, ""),
		mime: bounded(intent.mime, 160, "text/plain"),
		format: bounded(intent.format, 48, ""),
		intent: bounded(intent.intent, 32, "edit"),
		sourceApplication: bounded(intent.sourceApplication, 64, ""),
		preferredApplication: bounded(intent.preferredApplication, 64, ""),
		content
	};
}

function bounded(value, maximum, fallback) {
	const text = String(value || fallback);
	return text.slice(0, maximum);
}
