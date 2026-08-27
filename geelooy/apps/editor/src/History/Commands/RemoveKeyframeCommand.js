// B"H
import { Command } from '../../Core/Command.js';

export class RemoveKeyframeCommand extends Command {
    constructor(timelineManager, objectUUID, propertyPath, time, removedValue) {
        super();
        this.timelineManager = timelineManager;
        this.objectUUID = objectUUID;
        this.propertyPath = propertyPath;
        this.time = time;
        // We must store the value that was removed so we can restore it on undo
        this.removedValue = removedValue;
        this.name = `Remove Keyframe (${propertyPath} @ ${time.toFixed(2)}s)`;
    }

    execute() {
        // Use the internal method which doesn't create another command
        const success = this.timelineManager._removeKeyframeInternal(
            this.objectUUID,
            this.propertyPath,
            this.time
        );
        if (success) {
            // After removing, update the object's current state to reflect the animation change
            this.timelineManager.animator.update(this.timelineManager.currentTime);
        }
    }

    undo() {
        // To undo a removal, we add the keyframe back with its original value
        const success = this.timelineManager._addKeyframeInternal(
            this.objectUUID,
            this.propertyPath,
            this.time,
            this.removedValue
        );
        if (success) {
            // After re-adding, update the object's state
            this.timelineManager.animator.update(this.timelineManager.currentTime);
        }
    }
}