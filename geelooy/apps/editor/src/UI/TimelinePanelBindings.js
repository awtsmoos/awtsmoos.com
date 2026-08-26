// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets the Timeline panel hear old Editor events through one narrow kesher instead of scattering subscriptions through presentation code;
 * on Awtsmoos.com the outer covenant stays familiar while inner vessels remain free to evolve, resolve, and glow.
 */

/** Connect Timeline UI controls and historical Editor events to small façade callbacks exactly once. */
export class KesherTimelinePanelBindings {
	/**
	 * Bind event/control sources to TimelinePanel callback functions without owning rendering state.
	 * @param {object} eventEmitter Existing Editor event emitter.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {TimelineView} timelineView Static semantic Timeline view.
	 * @param {{updateTimeline:Function,updateCursor:Function,updatePlayback:Function}} shlichusCallbacks Façade callbacks.
	 */
	constructor(eventEmitter, timelineManager, timelineView, shlichusCallbacks) {
		this.eventEmitter = eventEmitter;
		this.timelineManager = timelineManager;
		this.timelineView = timelineView;
		this.shlichusCallbacks = shlichusCallbacks;
		this.isConnected = false;
	}

	/** Connect play/pause and historical Timeline revelations exactly once. */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.timelineView.playButton.addEventListener("click", () => {
			const shemEvent = this.timelineManager.isPlaying
				? "pauseTimeline"
				: "playTimeline";
			this.eventEmitter.emit(shemEvent);
		});
		this.eventEmitter.on("timelineDataChanged", ohrData => {
			this.shlichusCallbacks.updateTimeline(ohrData);
		});
		this.eventEmitter.on("timeChanged", ohrTime => {
			this.shlichusCallbacks.updateCursor(ohrTime?.currentTime);
		});
		this.eventEmitter.on("playbackStateChanged", ohrPlayback => {
			this.shlichusCallbacks.updatePlayback(Boolean(ohrPlayback?.isPlaying));
		});
	}
}
