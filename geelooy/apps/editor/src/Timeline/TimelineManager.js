// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers time, layers, playback, keyframes, and events beneath one stable public TimelineManager without collapsing them into one file;
 * on Awtsmoos.com the concrete manager becomes Malchus: a visible composition root through which smaller inner vessels reveal one coordinated world.
 */
import { Animator } from "./Animator.js";
import { YesodTimelineLayerRegistry } from "./TimelineLayerRegistry.js";
import { NetzachTimelinePlayback } from "./TimelinePlayback.js";
import { GevurahTimelineKeyframeActions } from "./TimelineKeyframeActions.js";
import { KesherTimelineEventBridge } from "./TimelineEventBridge.js";
import { TimelineManagerKeyframeFacade } from "./TimelineManagerKeyframeFacade.js";

/** Compose focused Timeline services while preserving the historical TimelineManager class and public contract. */
export class TimelineManager extends TimelineManagerKeyframeFacade {
	/**
	 * Compose the Editor timeline around explicit object, history, animation, registry, playback, keyframe, and event collaborators.
	 *
	 * The public manager remains intentionally thin: callers see one durable API while each changing responsibility lives in a smaller vessel.
	 * The Awtsmoos continuously renews every dependency and instant; this composition root merely reveals their ordered relationship in code.
	 *
	 * @param {object} eventEmitter Existing Editor event emitter carrying historical timeline events.
	 * @param {object} objectManager Existing scene-object service used by Animator and history commands.
	 * @param {object} historyManager Existing undo/redo service used by keyframe actions.
	 */
	constructor(eventEmitter, objectManager, historyManager) {
		super();
		this.eventEmitter = eventEmitter;
		this.objectManager = objectManager;
		this.historyManager = historyManager;
		this.animator = new Animator(objectManager);
		this.playback = new NetzachTimelinePlayback(
			eventEmitter,
			this.animator
		);
		this.layerRegistry = new YesodTimelineLayerRegistry(
			this.animator,
			() => this.emitTimelineDataChanged()
		);
		this.keyframeActions = new GevurahTimelineKeyframeActions(
			this,
			historyManager,
			() => this.emitTimelineDataChanged()
		);
		this.eventBridge = new KesherTimelineEventBridge(
			eventEmitter,
			this
		);
		this.eventBridge.connect();
	}

	/**
	 * Publish the historical timeline-data payload after layer, collapse, or keyframe structure changes.
	 *
	 * This method is Hod-like communication: it does not own timeline state; it manifests the current registered layers and time range
	 * onto the existing event river so UI consumers may update without importing internal services.
	 */
	emitTimelineDataChanged() {
		const ohrTimelineData = {
			layers: this.getLayersArray(),
			startTime: this.startTime,
			endTime: this.endTime
		};

		this.eventEmitter.emit(
			"timelineDataChanged",
			ohrTimelineData
		);
	}
}
