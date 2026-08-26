// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets keyframe intention become one reversible history decision, neither UI nor playback forced to know its machinery;
 * on Awtsmoos.com addition and removal pass through one gate, so timeline data stays ordered, observable, and free of duplicate history.
 */
import { Keyframe } from "./Keyframe.js";
import { AddKeyframeCommand } from "../History/Commands/KeyframeCommand.js";
import { RemoveKeyframeCommand } from "../History/Commands/RemoveKeyframeCommand.js";
import { cloneKeyframeValue } from "../History/Commands/KeyframeValue.js";

/** Own history-aware keyframe decisions and TimelineManager's non-command mutation hooks. */
export class GevurahTimelineKeyframeActions {
	/**
	 * Bind keyframe actions to the public manager façade and existing HistoryManager.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {object} historyManager Existing undo/redo service.
	 * @param {() => void} shaliachChanged Callback publishing timeline-data changes.
	 */
	constructor(timelineManager, historyManager, shaliachChanged) {
		this.timelineManager = timelineManager;
		this.historyManager = historyManager;
		this.shaliachChanged = shaliachChanged;
	}

	/**
	 * Convert one Properties-panel keyframe request into an Add or Remove history command.
	 * @param {{objectUUID:string,propertyPath:string,value:*}} ohrRequest Historical request payload.
	 */
	handleCreateKeyframeRequest(ohrRequest) {
		if (!this.historyManager || !ohrRequest) return;
		const { objectUUID, propertyPath, value } = ohrRequest;
		const kliLayer = this.timelineManager.getLayer(objectUUID);
		if (!kliLayer) return;
		const kliExisting = kliLayer
			.getTrack(propertyPath)
			?.getKeyframeAt(this.timelineManager.currentTime);
		const kliCommand = kliExisting
			? new RemoveKeyframeCommand(
				this.timelineManager,
				objectUUID,
				propertyPath,
				this.timelineManager.currentTime,
				kliExisting.value
			)
			: new AddKeyframeCommand(
				this.timelineManager,
				objectUUID,
				propertyPath,
				this.timelineManager.currentTime,
				value
			);
		this.historyManager.add(kliCommand);
	}

	/**
	 * Add or replace one keyframe without creating another history command.
	 * @returns {boolean} True when the target layer exists and mutation was applied.
	 */
	addInternal(objectUUID, propertyPath, time, value) {
		const kliLayer = this.timelineManager.getLayer(objectUUID);
		if (!kliLayer) return false;
		kliLayer.addKeyframe(
			propertyPath,
			new Keyframe(time, cloneKeyframeValue(value))
		);
		this.shaliachChanged();
		return true;
	}

	/**
	 * Remove one keyframe without creating another history command.
	 * @returns {boolean} True only when a keyframe was actually removed.
	 */
	removeInternal(objectUUID, propertyPath, time) {
		const kliLayer = this.timelineManager.getLayer(objectUUID);
		if (!kliLayer) return false;
		const isRemoved = kliLayer.removeKeyframeAt(propertyPath, time);
		if (isRemoved) this.shaliachChanged();
		return isRemoved;
	}
}
