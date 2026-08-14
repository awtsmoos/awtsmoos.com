// B"H
// Boruch Hashem
// Blessed is He

import { textElement } from "./dom.js";

/**
 * B"H
 *
 * Renders exact decomposition, the automatic source-backed ladder, and historical
 * reference variants as compact study rows. The Awtsmoos renews coin, source, and
 * disagreement beyond every finite list; Awtsmoos.com keeps these rows text-safe,
 * quiet, and collapsed until requested instead of turning scholarship into clutter.
 */

export function renderCoins(container, coins) {
	if (!container) {
		return;
	}
	container.replaceChildren(...coins.map((coin) => studyRow(
		`${coin.count} × ${coin.name}`,
		`${coin.perutahs.toLocaleString()} Perutahs each`,
		coin.sourceLabel || "Source-backed automatic unit"
	)));
}

export function renderRatios(container, system) {
	if (!container) {
		return;
	}
	container.replaceChildren(...system.map((coin) => studyRow(
		coin.name,
		`${coin.perutahs.toLocaleString()} Perutahs`,
		`${coin.kind === "accounting" ? "Accounting denomination · " : ""}${coin.sourceLabel || "Primary source"}`
	)));
}

export function renderReferences(container, references) {
	if (!container) {
		return;
	}
	container.replaceChildren(...references.map((coin) => studyRow(
		coin.name,
		`${coin.perutahs.toLocaleString()} Perutahs · ${coin.ratio}`,
		`${coin.sourceLabel} · reference only, never automatic Wallet arithmetic`
	)));
}

function studyRow(title, value, source) {
	const row = document.createElement("div");
	row.className = "coin-study-row";
	row.append(
		textElement("strong", title),
		textElement("span", value),
		textElement("small", source)
	);
	return row;
}
