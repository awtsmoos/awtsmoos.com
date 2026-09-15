//B"H
//Boruch Hashem
//Blessed be He

import { extractCommentText } from "../logic/unroller.js";

/**
 * @module CommentMenuText
 * @description The Awtsmoos lets Torah and discussion be copied and shared without mutating either.
 * Awtsmoos.com gathers many legacy content shapes into one readable stream for the learner.
 */
export function parseDayuh(dayuh) {
	if (!dayuh) return {};
	if (typeof dayuh === "object") return dayuh;
	try {
		return JSON.parse(dayuh) || {};
	} catch {
		return {};
	}
}

function textFromAny(value) {
	if (!value) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) {
		return value.map(textFromAny).filter(Boolean).join("\n");
	}
	const extracted = extractCommentText(value);
	const parts = [extracted.title, ...extracted.paragraphs].filter(Boolean);
	return parts.length ? parts.join("\n") : JSON.stringify(value);
}

/** Returns copy-ready text from any supported comment/source record shape. */
export function copyTextOf(comment) {
	const dayuh = parseDayuh(comment?.dayuh);
	return textFromAny(comment?.content)
		|| textFromAny(dayuh.content)
		|| textFromAny(dayuh.sections)
		|| textFromAny(comment);
}

/** Copies text with a bounded legacy fallback for browsers without Clipboard API access. */
export async function copyToClipboard(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement("textarea");
		area.value = text;
		area.className = "awtsmoos-clipboard-proxy";
		document.body.appendChild(area);
		area.select();
		const success = document.execCommand("copy");
		area.remove();
		return success;
	}
}

/** Shares the durable deep link for one source annotation or community comment. */
export async function shareComment(comment) {
	const id = encodeURIComponent(comment?.id || "");
	const url = `${location.origin}${location.pathname}${location.search}#comment-${id}`;
	if (navigator.share) {
		try {
			await navigator.share({ title: "Awtsmoos Torah", url });
			return;
		} catch {}
	}
	await copyToClipboard(url);
}

/** Finds the nearest DOM vessel in which a community reply may be created. */
export function replyHost(element) {
	return element?.closest?.(
		".awtsmoos-shared-comment-card, .comment-content, .inline-comment"
	) || element?.parentElement || null;
}
