// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos preserves yesterday's public DOM names while today's Timeline architecture becomes smaller and brighter;
 * on Awtsmoos.com this narrow compatibility vessel keeps old callers alive without forcing new modules to inherit forgotten structure.
 */

/** Own historical TimelinePanel DOM aliases so the orchestration façade can stay focused on composition and state flow. */
export class KesherTimelinePanelLegacyAliases {
	/**
	 * Bind one TimelinePanel façade to the semantic TimelineView it now delegates rendering to.
	 * @param {object} timelinePanel Historical public TimelinePanel instance.
	 * @param {object} timelineView Modern semantic Timeline view.
	 */
	constructor(timelinePanel, timelineView) {
		this.timelinePanel = timelinePanel;
		this.timelineView = timelineView;
	}

	/**
	 * Reveal the established DOM fields expected by older Editor integrations without duplicating or recreating any element.
	 */
	connect() {
		const kliPanel = this.timelinePanel;
		const kliView = this.timelineView;
		kliPanel.controlsElement = kliView.controlsElement;
		kliPanel.timeDisplayElement = kliView.timeDisplayElement;
		kliPanel.layersElement = kliView.layersElement;
		kliPanel.tracksContainerElement = kliView.tracksContainerElement;
		kliPanel.rulerElement = kliView.rulerElement;
		kliPanel.rulerMarksElement = kliView.rulerMarksElement;
		kliPanel.tracksElement = kliView.tracksElement;
		kliPanel.cursorElement = kliView.cursorElement;
		kliPanel.buttons = { play: kliView.playButton };
	}
}
