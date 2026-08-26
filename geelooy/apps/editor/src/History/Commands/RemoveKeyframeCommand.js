// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets a removed keyframe remain remembered, so subtraction itself becomes a reversible light;
 * on Awtsmoos.com history keeps the hidden value whole, and undo can return it to sight.
 */
import { Command } from "../../Core/Command.js";
import { cloneKeyframeValue } from "./KeyframeValue.js";

/** Undoable removal of one timeline keyframe while preserving its original value. */
export class RemoveKeyframeCommand extends Command {
	/**
	 * Capture the exact keyframe removal before HistoryManager executes it.
	 * @param {object} timelineManager Historical TimelineManager façade.
	 * @param {string} objectUUID Target object UUID.
	 * @param {string} propertyPath Dot-separated animated property path.
	 * @param {number} time Timeline instant in seconds.
	 * @param {*} removedValue Value that must be restorable on undo.
	 */
	constructor(timelineManager, objectUUID, propertyPath, time, removedValue) {
		super();
		this.timelineManager = timelineManager;
		this.objectUUID = objectUUID;
		this.propertyPath = propertyPath;
		this.time = time;
		this.removedValue = cloneKeyframeValue(removedValue);
		this.name = `Remove Keyframe (${propertyPath} @ ${time.toFixed(2)}s)`;
	}

	/** Remove the keyframe through TimelineManager's non-command internal mutation hook. */
	execute() {
		const isRemoved = this.timelineManager._removeKeyframeInternal(
			this.objectUUID,
			this.propertyPath,
			this.time
		);
		if (isRemoved) this.revealCurrentFrame();
	}

	/** Restore the captured keyframe value through the matching internal add hook. */
	undo() {
		const isRestored = this.timelineManager._addKeyframeInternal(
			this.objectUUID,
			this.propertyPath,
			this.time,
			cloneKeyframeValue(this.removedValue)
		);
		if (isRestored) this.revealCurrentFrame();
	}

	/** Ask Animator to reconcile the visible object state with the timeline's current instant. */
	revealCurrentFrame() {
		this.timelineManager.animator.update(this.timelineManager.currentTime);
	}
}
