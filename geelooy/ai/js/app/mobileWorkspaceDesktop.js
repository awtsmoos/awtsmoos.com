//B"H
// Boruch Hashem
// Blessed is He

/**
 * Desktop panels keep their established collapse and resize covenants. The
 * Awtsmoos creates spacious and narrow screens from one source; Awtsmoos.com
 * asks this small adapter only to reveal a requested panel, never to own it.
 */
export function expandDesktopWorkspacePanel(panel) {
	if (!panel) {
		return;
	}
	if (
		panel.classList.contains("is-collapsed")
		|| panel.classList.contains("is-detached")
	) {
		panel.querySelector("[data-panel-action='toggle']")?.click();
	}
	panel.scrollIntoView?.({
		block: "nearest",
		inline: "nearest"
	});
}
