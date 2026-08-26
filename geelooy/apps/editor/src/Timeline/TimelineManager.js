// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gathers time, layers, keyframes, and events beneath one stable public name without forcing them into one tangled file;
 * on Awtsmoos.com the façade stays simple while smaller inner vessels reveal each responsibility, clear in purpose and easy to refine.
 */
import { Animator } from "./Animator.js";
import { YesodTimelineLayerRegistry } from "./TimelineLayerRegistry.js";
import { NetzachTimelinePlayback } from "./TimelinePlayback.js";
import { GevurahTimelineKeyframeActions } from "./TimelineKeyframeActions.js";
import { KesherTimelineEventBridge } from "./TimelineEventBridge.js";

/** Historical TimelineManager API preserved as a thin façade over focused runtime collaborators. */
export class TimelineManager {
	/**
	 * Compose timeline services around the Editor's existing event, object, and history managers.
	 * @param {object} eventEmitter Existing Editor event emitter.
	 * @param {object} objectManager Existing scene-object service.
	 * @param {object} historyManager Existing undo/redo service.
	 */
	constructor(eventEmitter, objectManager, historyManager) {
		this.eventEmitter = eventEmitter;
		this.objectManager = objectManager;
		this.historyManager = historyManager;
		this.animator = new Animator(objectManager);
		this.playback = new NetzachTimelinePlayback(eventEmitter, this.animator);
		this.layerRegistry = new YesodTimelineLayerRegistry(
			this.animator,
			() => this.emitTimelineDataChanged()
		);
		this.keyframeActions = new GevurahTimelineKeyframeActions(
			this,
			historyManager,
			() => this.emitTimelineDataChanged()
		);
		this.eventBridge = new KesherTimelineEventBridge(eventEmitter, this);
		this.eventBridge.connect();
	}

	/** @returns {Map<string, object>} Historical public layer map. */
	get layers() { return this.layerRegistry.layers; }
	/** @returns {number} Current timeline instant. */
	get currentTime() { return this.playback.currentTime; }
	set currentTime(value) { this.playback.currentTime = value; }
	/** @returns {number} Timeline range start. */
	get startTime() { return this.playback.startTime; }
	set startTime(value) { this.playback.startTime = value; }
	/** @returns {number} Timeline range end. */
	get endTime() { return this.playback.endTime; }
	set endTime(value) { this.playback.endTime = value; }
	/** @returns {boolean} Whether automatic playback is active. */
	get isPlaying() { return this.playback.isPlaying; }
	set isPlaying(value) { this.playback.isPlaying = Boolean(value); }
	/** @returns {boolean} Whether the user is actively scrubbing. */
	get isScrubbing() { return this.playback.isScrubbing; }
	set isScrubbing(value) { this.playback.isScrubbing = Boolean(value); }

	/** Delegate Properties-panel create/remove keyframe intent to the history-aware action service. */
	handleCreateKeyframeRequest(request) { this.keyframeActions.handleCreateKeyframeRequest(request); }
	/** Historical command hook: mutate one keyframe without creating nested history. */
	_addKeyframeInternal(uuid, path, time, value) { return this.keyframeActions.addInternal(uuid, path, time, value); }
	/** Historical command hook: remove one keyframe without creating nested history. */
	_removeKeyframeInternal(uuid, path, time) { return this.keyframeActions.removeInternal(uuid, path, time); }
	/** @returns {object[]} Ordered snapshot of registered layers. */
	getLayersArray() { return this.layerRegistry.getLayersArray(); }
	/** Register selectable objects beneath an added scene subtree. */
	handleObjectAdded(object) { this.layerRegistry.handleObjectAdded(object); }
	/** Retire layers beneath a removed scene subtree. */
	handleObjectRemoved(object) { this.layerRegistry.handleObjectRemoved(object); }
	/** Register one selectable object. */
	createLayerForObject(object) { this.layerRegistry.createLayerForObject(object); }
	/** Remove one object's timeline layer. */
	removeLayerForObject(object) { this.layerRegistry.removeLayerForObject(object); }
	/** @returns {object|undefined} Layer for one object UUID. */
	getLayer(uuid) { return this.layerRegistry.getLayer(uuid); }
	/** Begin timeline playback. */
	play() { this.playback.play(); }
	/** Pause timeline playback. */
	pause() { this.playback.pause(); }
	/** Seek to one clamped instant and reveal it through Animator. */
	seek(time, isScrubbing = false) { return this.playback.seek(time, isScrubbing); }
	/** Advance the playback state machine from the render loop. */
	update(appTime, deltaTime) { this.playback.update(appTime, deltaTime); }
	/** Toggle one layer's disclosure state. */
	toggleLayerCollapse(uuid) { this.layerRegistry.toggleLayerCollapse(uuid); }

	/** Publish the historical timeline-data payload after structural/keyframe changes. */
	emitTimelineDataChanged() {
		this.eventEmitter.emit("timelineDataChanged", {
			layers: this.getLayersArray(),
			startTime: this.startTime,
			endTime: this.endTime
		});
	}
}
