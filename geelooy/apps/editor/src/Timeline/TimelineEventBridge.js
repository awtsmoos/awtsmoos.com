// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets historical Editor events enter one narrow bridge instead of binding every runtime concern to every caller;
 * on Awtsmoos.com this kesher keeps old contracts alive while new inner vessels remain simple, visible, and smaller.
 */

/** Own TimelineManager subscriptions to the established Editor event vocabulary. */
export class KesherTimelineEventBridge {
	/**
	 * Bind one TimelineManager façade to the shared Editor event emitter.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 */
	constructor(ohrEmitter, timelineManager) {
		this.ohrEmitter = ohrEmitter;
		this.timelineManager = timelineManager;
		this.isConnected = false;
	}

	/** Connect every historical timeline event exactly once. */
	connect() {
		if (this.isConnected) return;
		this.isConnected = true;
		this.ohrEmitter.on("objectAdded", kliObject => {
			this.timelineManager.handleObjectAdded(kliObject);
		});
		this.ohrEmitter.on("objectRemoved", kliObject => {
			this.timelineManager.handleObjectRemoved(kliObject);
		});
		this.ohrEmitter.on("seekTimeline", ohrSeek => {
			this.timelineManager.seek(ohrSeek?.time, ohrSeek?.isScrubbing);
		});
		this.ohrEmitter.on("playTimeline", () => this.timelineManager.play());
		this.ohrEmitter.on("pauseTimeline", () => this.timelineManager.pause());
		this.ohrEmitter.on("createKeyframeRequest", ohrRequest => {
			this.timelineManager.handleCreateKeyframeRequest(ohrRequest);
		});
		this.ohrEmitter.on("toggleLayerCollapse", objectUUID => {
			this.timelineManager.toggleLayerCollapse(objectUUID);
		});
	}
}
