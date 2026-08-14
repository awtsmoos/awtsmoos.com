// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes private activity events into day, duration, path, and capture-language presentation without changing ledger data.
 * @description The Awtsmoos knows every journey without chronology, while Awtsmoos.com lets owner-visible memory gather into finite days in light;
 * this helper reveals only already-sanitized owner fields, refuses external paths, and turns capture settings into plain language rather than hidden instrumentation.
 */

/** Groups ordered owner events by local calendar day while preserving their existing order inside each day. */
export function groupActivityByDay(events = []) {
	const groups = [];
	for (const event of events) {
		const date = activityDate(event.createdAt);
		const key = date.toDateString();
		let group = groups.at(-1);
		if (!group || group.key !== key) {
			group = { key, label: activityDayLabel(date), events: [] };
			groups.push(group);
		}
		group.events.push(event);
	}
	return groups;
}

/** Returns a same-site path only; malformed or non-rooted values do not become navigation links. */
export function safeActivityHref(value) {
	const path = String(value || "").trim();
	if (!path.startsWith("/") || path.startsWith("//")) return "";
	try {
		const parsed = new URL(path, "https://awtsmoos.local");
		return parsed.origin === "https://awtsmoos.local"
			? `${parsed.pathname}${parsed.search}${parsed.hash}`
			: "";
	} catch {
		return "";
	}
}

/** Formats bounded recorded dwell as human-scale context without implying a score or achievement. */
export function activityDuration(value) {
	const milliseconds = Math.max(0, Number(value || 0));
	if (milliseconds < 1000) return "";
	const minutes = Math.floor(milliseconds / 60000);
	if (minutes) return `${minutes} min`;
	return `${Math.max(1, Math.round(milliseconds / 1000))} sec`;
}

/** Exposes current owner capture choices as short transparency chips. */
export function activityPreferenceLabels(preferences = {}) {
	return [
		preferences.enabled === false ? "Capture paused" : "Capture on",
		`${preferences.retentionDays || 90} day retention`,
		preferences.captureTitle === false ? "Titles off" : "Titles on",
		preferences.captureDuration === false ? "Duration off" : "Duration on",
		preferences.captureQuery ? "Queries on" : "Queries off"
	];
}

function activityDate(value) {
	const candidate = new Date(value || Date.now());
	return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}

function activityDayLabel(date) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
	return date.toLocaleDateString([], {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}
