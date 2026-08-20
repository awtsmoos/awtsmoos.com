// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ResponsivePanels
 * @description
 * The Awtsmoos lets Advanced widen into the full editorial map while Simple
 * and narrow vessels keep one deliberate decision visible at a time.
 */
import { currentComposerMode } from "./composerModes.js";

const FOCUSED_PANEL_QUERY = "(max-width: 1080px)";
const PREVIEW_SHEET_QUERY = "(max-width: 820px)";
let previewInvoker = null;

export function configureMajorPanels({ preferContent = false } = {}) {
	const panels = majorPanels();
	if (!panels.length) {
		return;
	}
	if (wideAdvanced()) {
		panels.forEach(panel => panel.open = true);
		return;
	}
	const opened = panels.filter(panel => panel.open);
	const target = !preferContent && opened.length === 1
		? opened[0]
		: contentPanel(panels);
	panels.forEach(panel => panel.open = panel === target);
}

function collapseSiblingMajorPanels(event) {
	const activePanel = event.currentTarget;
	if (!activePanel.open || wideAdvanced()) {
		return;
	}
	majorPanels().forEach(panel => panel.open = panel === activePanel);
}

function majorPanels() {
	return [...document.querySelectorAll(".majorPanel")];
}

function contentPanel(panels) {
	return panels.find(panel => panel.dataset.mobilePanel === "content") || panels[0];
}

function wideAdvanced() {
	return !window.matchMedia(FOCUSED_PANEL_QUERY).matches
		&& currentComposerMode() === "advanced";
}

function configurePreviewAvailability() {
	const sheet = document.querySelector(".previewColumn");
	if (!sheet) {
		return;
	}
	const mobile = window.matchMedia(PREVIEW_SHEET_QUERY).matches;
	const hidden = mobile && !sheet.classList.contains("is-open");
	sheet.inert = hidden;
	sheet.setAttribute("aria-hidden", hidden ? "true" : "false");
}

export function closePreviewSheet() {
	const sheet = document.querySelector(".previewColumn");
	if (!sheet?.classList.contains("is-open")) {
		return;
	}
	sheet.classList.remove("is-open");
	document.body.classList.remove("preview-sheet-open");
	configurePreviewAvailability();
	previewInvoker?.focus();
}

export function openPreviewSheet(event) {
	const sheet = document.querySelector(".previewColumn");
	if (!sheet) {
		return;
	}
	if (!window.matchMedia(PREVIEW_SHEET_QUERY).matches) {
		sheet.scrollIntoView({ behavior: "smooth", block: "start" });
		return;
	}
	previewInvoker = event.currentTarget;
	sheet.classList.add("is-open");
	sheet.inert = false;
	sheet.setAttribute("aria-hidden", "false");
	document.body.classList.add("preview-sheet-open");
	document.getElementById("closeMobilePreviewButton")?.focus();
}

export function installResponsivePanels() {
	const panelQuery = window.matchMedia(FOCUSED_PANEL_QUERY);
	const previewQuery = window.matchMedia(PREVIEW_SHEET_QUERY);
	configureMajorPanels({ preferContent: true });
	configurePreviewAvailability();
	majorPanels().forEach(panel => panel.addEventListener("toggle", collapseSiblingMajorPanels));
	panelQuery.addEventListener("change", () => configureMajorPanels());
	previewQuery.addEventListener("change", configurePreviewAvailability);
	window.addEventListener("awtsmoosComposerMode", () => configureMajorPanels({ preferContent: true }));
	document.getElementById("mobilePreviewButton")?.addEventListener("click", openPreviewSheet);
	document.getElementById("closeMobilePreviewButton")?.addEventListener("click", closePreviewSheet);
	document.addEventListener("keydown", event => {
		if (event.key === "Escape") closePreviewSheet();
	});
}
