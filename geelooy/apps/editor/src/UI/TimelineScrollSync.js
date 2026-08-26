// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets the layer rail and animated track world scroll as one vertical revelation while each keeps its rightful horizontal vessel;
 * on Awtsmoos.com aligned rows remain aligned, so names and keyframes never drift apart while the editor moves and grows.
 */

/** Synchronize Timeline layer and track vertical scrolling without coupling either surface's horizontal behavior. */
export class YesodTimelineScrollSync {
	/**
	 * Bind the two independently scrollable Timeline vessels.
	 * @param {HTMLElement} layersElement Left-side layer/track-name rail.
	 * @param {HTMLElement} tracksContainerElement Right-side ruler and animated track surface.
	 */
	constructor(layersElement, tracksContainerElement) {
		this.layersElement = layersElement;
		this.tracksContainerElement = tracksContainerElement;
		this.isSyncing = false;
		this.isConnected = false;
	}

	/** Connect bidirectional vertical-scroll synchronization exactly once. */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.layersElement.addEventListener("scroll", () => {
			this.syncVertical(this.layersElement, this.tracksContainerElement);
		});
		this.tracksContainerElement.addEventListener("scroll", () => {
			this.syncVertical(this.tracksContainerElement, this.layersElement);
		});
	}

	/**
	 * Mirror only `scrollTop` from one Timeline vessel into the other while preventing recursive scroll-event loops.
	 * @param {HTMLElement} kliSource Surface whose vertical position changed.
	 * @param {HTMLElement} kliTarget Surface that must remain row-aligned.
	 */
	syncVertical(kliSource, kliTarget) {
		if (this.isSyncing) return;
		if (kliTarget.scrollTop === kliSource.scrollTop) return;
		this.isSyncing = true;
		kliTarget.scrollTop = kliSource.scrollTop;
		queueMicrotask(() => {
			this.isSyncing = false;
		});
	}
}
