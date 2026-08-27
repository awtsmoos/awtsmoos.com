//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is One while many shitos may rest inside one small disclosure below;
 * Awtsmoos.com reveals count, primary crown, and every native choice without forcing a phone to carry the whole river in one visible flow.
 */

import { ZMANIM_OPINIONS } from "../config/opinions.js";

/** Render the collapsed-state truth: how many methods participate and which one is primary. */
export function renderOpinionSummary(selectedIds, primaryOpinionId) {
	const summary = document.createElement("summary");
	summary.className = "opinion-summary";
	const primary = ZMANIM_OPINIONS[primaryOpinionId] || ZMANIM_OPINIONS.chabad;
	const total = Object.keys(ZMANIM_OPINIONS).length;
	summary.innerHTML = `
		<span class="opinion-summary-copy">
			<small>Calculation methods</small>
			<strong>${selectedIds.length} of ${total} selected</strong>
			<span>Primary · ${primary.shortLabel}</span>
		</span>
		<span class="opinion-summary-mark" aria-hidden="true">＋</span>`;
	return summary;
}

/** Build compact bulk actions that remain reachable even while the detailed list is collapsed. */
export function renderOpinionToolbar() {
	const toolbar = document.createElement("div");
	toolbar.className = "opinion-toolbar";
	toolbar.innerHTML = `
		<span class="opinion-toolbar-label">Quick set</span>
		<span class="opinion-actions">
			<button type="button" data-opinion-action="all">All supported</button>
			<button type="button" data-opinion-action="chabad">Chabad only</button>
		</span>`;
	return toolbar;
}

/** Render one checkbox label beside a separate primary-method button with valid interaction semantics. */
export function renderOpinionChoice(opinionId, selectedIds, primaryOpinionId) {
	const opinion = ZMANIM_OPINIONS[opinionId];
	const selected = selectedIds.includes(opinionId);
	const primary = primaryOpinionId === opinionId;
	const choice = document.createElement("div");
	choice.className = "opinion-choice";
	choice.dataset.selected = String(selected);
	choice.dataset.primary = String(primary);
	choice.innerHTML = `
		<label class="opinion-choice-label">
			<input type="checkbox" data-opinion-check="${opinion.id}" ${selected ? "checked" : ""}>
			<span class="opinion-copy">
				<strong>${opinion.shortLabel}</strong>
				<small>${opinion.basis}</small>
			</span>
		</label>
		<button type="button" class="primary-opinion" data-primary-opinion="${opinion.id}" aria-pressed="${primary}" ${selected ? "" : "disabled"}>${primary ? "Primary" : "Make primary"}</button>`;
	return choice;
}
