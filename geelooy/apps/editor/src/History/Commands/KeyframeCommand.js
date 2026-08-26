// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one keyframe enter history as a reversible covenant, clear in intent and faithful in state;
 * on Awtsmoos.com each captured value can travel forward and back, while mutable vessels never secretly mate.
 */
import { Command } from "../../Core/Command.js";
import { Track } from "../../Timeline/Track.js";
import { cloneKeyframeValue } from "./KeyframeValue.js";

/** Undoable addition or replacement of one timeline keyframe. */
export class AddKeyframeCommand extends Command {
	/**
	 * Capture one requested keyframe addition without mutating the timeline until HistoryManager executes it.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {string} objectUUID Target object UUID.
	 * @param {string} propertyPath Dot-separated animated property path.
	 * @param {number} time Timeline instant in seconds.
	 * @param {*} value Scene-domain value captured at creation time.
	 */
	constructor(timelineManager, objectUUID, propertyPath, time, value) {
		super();
		this.timelineManager = timelineManager;
		this.objectUUID = objectUUID;
		this.propertyPath = propertyPath;
		this.time = time;
		this.value = cloneKeyframeValue(value);
		this.previousValueAtTime = null;
		this.name = `Add Keyframe (${propertyPath} @ ${time.toFixed(2)}s)`;
	}

	/**
	 * Add or replace the keyframe while remembering any displaced value for a truthful undo.
	 */
	execute() {
		const kliLayer = this.timelineManager.getLayer(this.objectUUID);
		if (!kliLayer) return;
		const kliExisting = kliLayer.getTrack(this.propertyPath)?.getKeyframeAt(this.time);
		this.previousValueAtTime = kliExisting
			? cloneKeyframeValue(kliExisting.value)
			: null;
		const isAdded = this.timelineManager._addKeyframeInternal(
			this.objectUUID,
			this.propertyPath,
			this.time,
			this.value
		);
		if (isAdded) this.revealStaticValue();
	}

	/** Restore the displaced keyframe when one existed, otherwise remove the keyframe introduced by execute. */
	undo() {
		if (this.previousValueAtTime !== null) {
			this.timelineManager._addKeyframeInternal(
				this.objectUUID,
				this.propertyPath,
				this.time,
				this.previousValueAtTime
			);
		} else {
			this.timelineManager._removeKeyframeInternal(
				this.objectUUID,
				this.propertyPath,
				this.time
			);
		}
		this.timelineManager.animator.update(this.timelineManager.currentTime);
	}

	/**
	 * When playback is still, immediately reveal the newly keyed value on the scene object.
	 */
	revealStaticValue() {
		if (this.timelineManager.isPlaying || this.timelineManager.isScrubbing) return;
		const kliObject = this.timelineManager.objectManager.getObjectByUUID(this.objectUUID);
		if (!kliObject) return;
		Track.setObjectPropertyValue(
			kliObject,
			this.propertyPath,
			cloneKeyframeValue(this.value)
		);
	}
}
