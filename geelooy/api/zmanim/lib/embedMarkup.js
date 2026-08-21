//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond list, timeline, method, and comparison while each calculated instant receives a truthful semantic place;
 * Awtsmoos.com renders only serialized Zmanim data here, escaping every label so static embeds remain safe, readable, and full of grace.
 */

const { escapeHtml } = require("./htmlEscape.js");

const KEY_IDS = new Set([
	"alos",
	"sunrise",
	"sofShema",
	"chatzos",
	"minchaKetana",
	"sunset",
	"tzeis"
]);

/** Render the complete semantic body for one serialized day and normalized presentation. */
function renderEmbedMarkup(
	day,
	presentation,
	interactiveHref,
	now = Date.now(),
	comparisonMarkup = ""
) {
	const sections = new Set(presentation.sections);
	const parts = [renderHeader(day)];
	if (sections.has("next")) {
		parts.push(renderNext(day, now));
	}
	if (sections.has("key")) {
		parts.push(renderZmanSection("Key times", day.zmanim.filter(item => KEY_IDS.has(item.id))));
	}
	if (sections.has("timeline")) {
		parts.push(renderTimeline(day.zmanim.filter(item => KEY_IDS.has(item.id))));
	}
	if (sections.has("sky") && presentation.sky !== "off") {
		parts.push(renderSkyLink(interactiveHref));
	}
	if (sections.has("all")) {
		parts.push(renderZmanSection("All zmanim", day.zmanim));
	}
	if (sections.has("methods")) {
		parts.push(renderMethod(day));
	}
	if (comparisonMarkup) {
		parts.push(comparisonMarkup);
	}
	parts.push(renderWarnings(day));
	return parts.filter(Boolean).join("\n");
}

/** Render date, location, timezone, and primary opinion without duplicating calculation. */
function renderHeader(day) {
	const location = escapeHtml(day.location.label || "Selected location");
	return `<header>
	<p class="badge">B&quot;H · Server-rendered Zmanim</p>
	<h1>${location}</h1>
	<div class="meta"><span>${escapeHtml(day.date)}</span><span>${escapeHtml(day.location.timezone)}</span><span>${escapeHtml(day.opinion.label)}</span></div>
</header>`;
}

/** Render the first zman whose absolute instant is not in the past. */
function renderNext(day, now) {
	const next = day.zmanim.find(item => {
		const instant = item.available ? Date.parse(item.instant) : Number.NaN;
		return Number.isFinite(instant) && instant >= now;
	});
	if (!next) {
		return "";
	}
	return `<section><h2>Next zman</h2><div class="next-zman"><strong>${escapeHtml(next.label)}</strong><time datetime="${escapeHtml(next.instant)}">${escapeHtml(next.display)}</time><small>${escapeHtml(next.note)}</small></div></section>`;
}

/** Render one ordinary semantic zman list from already-localized display values. */
function renderZmanSection(title, items) {
	const rows = items.filter(item => item.available).map(renderZmanRow).join("");
	return rows ? `<section><h2>${escapeHtml(title)}</h2><ol class="zman-list">${rows}</ol></section>` : "";
}

/** Render one time row with machine-readable ISO datetime and human-local display. */
function renderZmanRow(item) {
	return `<li><strong>${escapeHtml(item.label)}</strong><time datetime="${escapeHtml(item.instant)}">${escapeHtml(item.display)}</time><small>${escapeHtml(item.note)}</small></li>`;
}

/** Render a compact horizontally scrollable timeline from the canonical key set. */
function renderTimeline(items) {
	const rows = items.filter(item => item.available).map(item => {
		return `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.display)}</span></li>`;
	}).join("");
	return rows ? `<section><h2>Timeline</h2><ol class="timeline">${rows}</ol></section>` : "";
}

/** Explain the server/static boundary while offering the native interactive celestial vessel. */
function renderSkyLink(href) {
	return `<section><a class="sky-link" href="${escapeHtml(href)}" target="_blank" rel="noopener"><span><strong>Celestial sky</strong><br><small>Static HTML stays GPU-free.</small></span><b>Open interactive sky →</b></a></section>`;
}

/** Render primary opinion and seasonal-hour details supplied by the calculation payload. */
function renderMethod(day) {
	return `<section><h2>Method</h2><p><strong>${escapeHtml(day.opinion.label)}</strong></p><p class="warning">Shaah zmanis: ${escapeHtml(day.shaahZmanis.display)} · ${escapeHtml(day.opinion.description || "")}</p></section>`;
}

/** Preserve the API's uncertainty warnings in every static document. */
function renderWarnings(day) {
	const warnings = (day.warnings || []).map(text => `<p class="warning">${escapeHtml(text)}</p>`).join("");
	return `<footer>${warnings}<p>Powered by Awtsmoos.com · JSON: /api/zmanim/day · Compare: /api/zmanim/compare</p></footer>`;
}

module.exports = {
	renderEmbedMarkup
};
