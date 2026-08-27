// B"H
import { Command } from '../../Core/Command.js';
import { Keyframe } from '../../Timeline/Keyframe.js'; // Needed for undo
import { Track } from '../../Timeline/Track.js'; // Needed for getting property value

export class AddKeyframeCommand extends Command {
    constructor(timelineManager, objectUUID, propertyPath, time, value) {
        super();
        this.timelineManager = timelineManager;
        this.objectUUID = objectUUID;
        this.propertyPath = propertyPath;
        this.time = time;
        this.value = this._cloneValue(value); // Clone the value passed in
        this.previousValueAtTime = null; // Store if a keyframe was overwritten
        this.name = `Add Keyframe (${propertyPath} @ ${time.toFixed(2)}s)`;
    }

    _cloneValue(val) {
        // Use the same cloning logic as Keyframe class
        if (val === null || typeof val !== 'object') return val;
        if (typeof val.clone === 'function') return val.clone();
        if (Array.isArray(val)) return val.map(item => this._cloneValue(item));
        return { ...val };
    }

    execute() {
        const layer = this.timelineManager.getLayer(this.objectUUID);
        if (!layer) return;
        const track = layer.getTrack(this.propertyPath);

        // Check if a keyframe already exists at this exact time
        const existingKeyframe = track?.getKeyframeAt(this.time);
        if (existingKeyframe) {
            this.previousValueAtTime = existingKeyframe.value; // Store overwritten value for undo
        } else {
            this.previousValueAtTime = null;
        }

        // Use the internal method which doesn't create another command
        const success = this.timelineManager._addKeyframeInternal(
            this.objectUUID,
            this.propertyPath,
            this.time,
            this.value
        );
         if (success) console.log(`Executed AddKeyframeCommand`);

         // Update the object's current state if timeline is not playing
         // This ensures the object visually matches the new keyframe immediately
         if (!this.timelineManager.isPlaying && !this.timelineManager.isScrubbing) {
            const object = this.timelineManager.objectManager.getObjectByUUID(this.objectUUID);
            if (object) {
                 Track.setObjectPropertyValue(object, this.propertyPath, this.value);
            }
         }
    }

    undo() {
        const layer = this.timelineManager.getLayer(this.objectUUID);
        if (!layer) return;

        if (this.previousValueAtTime !== null) {
            // Restore the previously overwritten keyframe
            this.timelineManager._addKeyframeInternal(
                this.objectUUID,
                this.propertyPath,
                this.time,
                this.previousValueAtTime
            );
        } else {
            // Simply remove the keyframe that was added
            this.timelineManager._removeKeyframeInternal(
                this.objectUUID,
                this.propertyPath,
                this.time
            );
        }

        // Update the object's current state after undo
         if (!this.timelineManager.isPlaying && !this.timelineManager.isScrubbing) {
             // Force animator update to reflect removal/change
             this.timelineManager.animator.update(this.timelineManager.currentTime);
         }

        console.log(`Undone AddKeyframeCommand`);
    }
}