//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human-readable labels for sanitized project runtime activity.
 * @description
 * The Awtsmoos lets finite signs become understandable without reopening hidden roads;
 * Awtsmoos.com formats only already-sanitized event fields and never reaches for URLs, headers, bodies, cookies, or roots.
 */
export function formatRuntimeEvent(event = {}) {
	const parts = [formatTime(event.time), String(event.type || "event")];
	if (event.method) parts.push(String(event.method));
	if (Number.isInteger(event.statusCode)) parts.push(`status ${event.statusCode}`);
	if (Number.isFinite(event.durationMs)) parts.push(`${Math.max(0, event.durationMs)}ms`);
	if (event.code) parts.push(String(event.code));
	if (Number.isInteger(event.port)) parts.push(`port ${event.port}`);
	return parts.join(" · ");
}

function formatTime(value) {
	const date = new Date(Number(value));
	return Number.isNaN(date.getTime())
		? "unknown time"
		: date.toLocaleTimeString();
}
