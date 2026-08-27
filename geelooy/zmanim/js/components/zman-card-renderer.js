//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates each zman once while selected methods may clothe that moment in several measured lines;
 * Awtsmoos.com keeps the primary time visible, folds secondary differences on small screens, and reveals every shita when the reader inclines.
 */

import { comparisonValues } from "../domain/comparison-values.js";
import { MalchusTimeFormatter } from "../domain/timezone.js";

/** Format one selected-opinion instant without duplicating timezone semantics. */
function formattedTime(row, timezone) {
	return row?.time
		? MalchusTimeFormatter.time(row.time, timezone)
		: "Unavailable";
}

/** Build one readable per-opinion comparison row. */
function comparisonRow(row, timezone) {
	const item = document.createElement("div");
	item.className = "comparison-row";
	item.dataset.primary = String(row.primary);
	const label = document.createElement("span");
	label.textContent = row.opinion.shortLabel;
	const time = document.createElement("strong");
	time.textContent = formattedTime(row, timezone);
	item.append(label, time);
	return item;
}

/** Build a mobile-foldable comparison whose summary always preserves the primary method time. */
function comparisonDetails(comparison, timezone) {
	const details = document.createElement("details");
	details.className = "zman-values zman-comparison-details";
	details.open = globalThis.matchMedia?.("(min-width: 521px)").matches ?? true;
	const primary = comparison.rows.find(row => row.primary) || comparison.rows[0];
	const summary = document.createElement("summary");
	summary.className = "zman-comparison-summary";
	const time = document.createElement("strong");
	time.textContent = formattedTime(primary, timezone);
	const count = document.createElement("small");
	count.textContent = `Compare ${comparison.rows.length} methods`;
	summary.append(time, count);
	const body = document.createElement("div");
	body.className = "zman-comparison-body";
	for (const row of comparison.rows) {
		body.append(comparisonRow(row, timezone));
	}
	details.append(summary, body);
	return details;
}

/** Build the main time area, collapsing equal values and folding only genuine method differences. */
export function renderZmanValues(viewData, definition) {
	const comparison = comparisonValues(
		viewData.calculations,
		definition.id,
		viewData.primaryOpinionId
	);
	if (!comparison.single && !comparison.shared && !comparison.unavailable) {
		return comparisonDetails(comparison, viewData.timezone);
	}
	const wrapper = document.createElement("div");
	wrapper.className = "zman-values";
	if (comparison.unavailable) {
		wrapper.textContent = "Not reached";
		wrapper.classList.add("zman-values-unavailable");
		return wrapper;
	}
	const time = document.createElement("strong");
	time.className = "zman-time";
	time.textContent = formattedTime(comparison.available[0], viewData.timezone);
	wrapper.append(time);
	if (comparison.shared) {
		const shared = document.createElement("small");
		shared.textContent = `Shared across ${comparison.rows.length} selected methods`;
		wrapper.append(shared);
	}
	return wrapper;
}

/** Build the expandable method note beneath one zman without expanding explanatory prose by default. */
export function renderMethodNote(definition, unavailable) {
	if (unavailable) {
		const note = document.createElement("p");
		note.className = "zman-unavailable-note";
		note.textContent = "This solar event is not reached here on this date; ask a rav for high-latitude guidance.";
		return note;
	}
	const details = document.createElement("details");
	details.className = "zman-note-details";
	const summary = document.createElement("summary");
	summary.textContent = "Method";
	const note = document.createElement("p");
	note.textContent = definition.note;
	details.append(summary, note);
	return details;
}
