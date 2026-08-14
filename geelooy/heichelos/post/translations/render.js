// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostTranslationRenderer
 * @description
 * The Awtsmoos places English beneath the exact original phrase without mutation.
 * Awtsmoos.com keeps every translation read-only, visible, and phone-friendly.
 */
import { groupTranslationRows, translationText } from "./alignment.js";

const STORAGE_KEY = "awtsmoos.post.translation.visible";

function statusText(report) {
	const rows = report?.rows || [];
	const status = report?.meta?.source?.status || "unknown";
	if (status === "loading") return "Loading English translation…";
	if (rows.length) return `English translation · ${rows.length} aligned phrase${rows.length === 1 ? "" : "s"}`;
	if (status === "migration_required") return "English translation is being moved into the safe reader API.";
	if (status === "source_missing") return "An English translation source is not yet materialized for this corpus.";
	if (status === "ready") return "English translation is not available for this teaching yet.";
	return "English translation is unavailable for this teaching.";
}

function updateToggle(button, visible) {
	button.textContent = visible ? "Hide English" : "Show English";
	button.setAttribute("aria-pressed", visible ? "true" : "false");
}

function makeToggle(viewport) {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "awtsmoos-translation-toggle";
	let visible = localStorage.getItem(STORAGE_KEY) !== "0";
	viewport.classList.toggle("awtsmoos-translations-hidden", !visible);
	updateToggle(button, visible);
	button.addEventListener("click", () => {
		visible = !visible;
		viewport.classList.toggle("awtsmoos-translations-hidden", !visible);
		localStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
		updateToggle(button, visible);
	});
	return button;
}

function mountToolbar(viewport, report) {
	viewport.querySelector(".awtsmoos-translation-toolbar")?.remove();
	const toolbar = document.createElement("section");
	toolbar.className = "awtsmoos-translation-toolbar";
	toolbar.setAttribute("aria-live", "polite");
	const label = document.createElement("span");
	label.className = "awtsmoos-translation-status";
	label.textContent = statusText(report);
	toolbar.appendChild(label);
	if (report?.rows?.length) toolbar.appendChild(makeToggle(viewport));
	const crown = viewport.querySelector(".awtsmoos-post-title-crown");
	if (crown) crown.insertAdjacentElement("afterend", toolbar);
	else viewport.prepend(toolbar);
}

function targetFor(viewport, verse, domSub) {
	return viewport.querySelector(`.sub-awtsmoos[data-awtsmoos-idx="${verse}"][data-awtsmoos-sub="${domSub}"]`)
		|| viewport.querySelector(`.section[data-awtsmoos-idx="${verse}"] > .toichen`);
}

function makeBlock(group) {
	const block = document.createElement("aside");
	block.className = "awtsmoos-translation-block";
	block.dataset.translationVerse = String(group.verse);
	block.dataset.translationSub = String(group.domSub);
	block.lang = "en";
	block.dir = "ltr";
	const kicker = document.createElement("span");
	kicker.className = "awtsmoos-translation-kicker";
	kicker.textContent = "English";
	block.appendChild(kicker);
	for (const row of group.rows) {
		const paragraph = document.createElement("p");
		paragraph.textContent = translationText(row);
		block.appendChild(paragraph);
	}
	return block;
}

export function renderTranslationReport(viewport, report) {
	if (!viewport) return { mounted: 0, missingTargets: 0 };
	viewport.querySelectorAll(".awtsmoos-translation-block").forEach(node => node.remove());
	mountToolbar(viewport, report);
	let mounted = 0;
	let missingTargets = 0;
	for (const group of groupTranslationRows(report?.rows || [])) {
		const target = targetFor(viewport, group.verse, group.domSub);
		if (!target) {
			missingTargets++;
			continue;
		}
		target.insertAdjacentElement("afterend", makeBlock(group));
		mounted++;
	}
	return { mounted, missingTargets };
}
