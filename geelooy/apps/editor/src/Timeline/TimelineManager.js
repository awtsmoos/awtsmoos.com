// B"H
import { Layer } from './Layer.js';
import { Animator } from './Animator.js';
import { Keyframe } from './Keyframe.js';
import { Track } from './Track.js'; // Needed for static methods
import { AddKeyframeCommand } from '../History/Commands/KeyframeCommand.js'; // Assuming this exists

/**
 * Manages the animation timeline state, layers, tracks, keyframes, and playback.
 */
export class TimelineManager {
    constructor(eventEmitter, objectManager, historyManager) {
        this.eventEmitter = eventEmitter;
        this.objectManager = objectManager;
        this.historyManager = historyManager; // For adding keyframe commands

        this.layers = new Map(); // Map<objectUUID, Layer>
        this.animator = new Animator(this.objectManager);
        this.animator.setLayers(this.getLayersArray()); // Initial set

        this.currentTime = 0;
        this.startTime = 0;
        this.endTime = 10; // Default duration
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.isScrubbing = false;

        // Listen for object changes to manage layers
        this.eventEmitter.on('objectAdded', this.handleObjectAdded.bind(this));
        this.eventEmitter.on('objectRemoved', this.handleObjectRemoved.bind(this));
        this.eventEmitter.on('objectRenamed', this.handleObjectRenamed.bind(this)); // Need to implement rename logic

        // Listen for UI requests
        this.eventEmitter.on('seekTimeline', this.seek.bind(this));
        this.eventEmitter.on('playTimeline', this.play.bind(this));
        this.eventEmitter.on('pauseTimeline', this.pause.bind(this));
        this.eventEmitter.on('setTimelineDuration', this.setDuration.bind(this));
        this.eventEmitter.on('createKeyframeRequest', this.handleCreateKeyframeRequest.bind(this));
        this.eventEmitter.on('toggleLayerCollapse', this.toggleLayerCollapse.bind(this));


        console.log("B\"H - TimelineManager Initialized");
    }

    getLayersArray() {
        return Array.from(this.layers.values());
    }

    handleObjectAdded(object) {
        // Add layers recursively for groups/loaded models
         object.traverse((obj) => {
            if (obj.userData?.isSelectable && !this.layers.has(obj.uuid)) {
                 this.createLayerForObject(obj);
            }
         });
    }

    handleObjectRemoved(object) {
         // Remove layers recursively
         object.traverse((obj) => {
             if (this.layers.has(obj.uuid)) {
                  this.removeLayerForObject(obj);
             }
         });
         this.animator.setLayers(this.getLayersArray()); // Update animator
         this.emitTimelineDataChanged();
    }

     handleObjectRenamed(object) {
        if(this.layers.has(object.uuid)) {
             this.layers.get(object.uuid).objectName = object.name;
             this.emitTimelineDataChanged(); // Update UI
        }
     }

    createLayerForObject(object) {
        if (!object || !object.uuid || this.layers.has(object.uuid)) {
            return null;
        }
        const layer = new Layer(object.uuid, object.name);
        this.layers.set(object.uuid, layer);
        this.animator.setLayers(this.getLayersArray()); // Update animator's layer list
        this.emitTimelineDataChanged(); // Notify UI to add the layer
        console.log(`Created timeline layer for ${object.name} (${object.uuid})`);
        return layer;
    }

    removeLayerForObject(object) {
        if (object && this.layers.has(object.uuid)) {
            this.layers.delete(object.uuid);
            this.animator.setLayers(this.getLayersArray());
            this.emitTimelineDataChanged(); // Notify UI
             console.log(`Removed timeline layer for ${object.name} (${object.uuid})`);
        }
    }

     getLayer(objectUUID) {
        return this.layers.get(objectUUID);
     }


     // --- Playback Control ---

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        if (this.currentTime >= this.endTime) {
            this.currentTime = this.startTime; // Loop back if at end
        }
        this.eventEmitter.emit('playbackStateChanged', { isPlaying: true });
        console.log("Timeline playing");
        // The main App animation loop drives the time update via update()
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        this.eventEmitter.emit('playbackStateChanged', { isPlaying: false });
        console.log("Timeline paused");
    }

    seek(time, isScrubbing = false) {
        this.currentTime = Math.max(this.startTime, Math.min(this.endTime, time));
        this.isScrubbing = isScrubbing;
        if (!isScrubbing) {
            // If not scrubbing, force an animator update immediately
            this.animator.update(this.currentTime);
            // And maybe re-render? The main loop should handle rendering.
        }
        this.eventEmitter.emit('timeChanged', { currentTime: this.currentTime, isScrubbing });
    }

     setDuration(endTime, startTime = 0) {
        this.startTime = Math.max(0, startTime);
        this.endTime = Math.max(this.startTime + 0.1, endTime); // Ensure end is after start
        this.seek(this.currentTime); // Ensure current time is within new bounds
        this.eventEmitter.emit('durationChanged', { startTime: this.startTime, endTime: this.endTime });
        this.emitTimelineDataChanged(); // Ruler needs redraw
        console.log(`Timeline duration set: ${this.startTime}s - ${this.endTime}s`);
     }

    update(appTime, deltaTime) { // Called from App's animation loop
        if (this.isPlaying && !this.isScrubbing) {
            let newTime = this.currentTime + (deltaTime * this.playbackSpeed);
            if (newTime > this.endTime) {
                newTime = this.startTime; // Loop for now
                // Alternatively: pause()
            }
            // Use seek to update time and emit event
            this.seek(newTime, false);
        }

        // Animator update happens naturally via seek or here if just playing
        // No, the main App loop calls animator.update AFTER this update.
        // this.animator.update(this.currentTime); // Call animator to apply state for current time
    }

     getCurrentTime() {
        return this.currentTime;
     }

     getDuration() {
         return this.endTime - this.startTime;
     }

     // --- Keyframe Management ---

     handleCreateKeyframeRequest({ objectUUID, propertyPath, value }) {
        const layer = this.layers.get(objectUUID);
        if (!layer) {
             console.warn(`Cannot add keyframe: Layer not found for object ${objectUUID}`);
             return;
        }

         const command = new AddKeyframeCommand(
             this,
             objectUUID,
             propertyPath,
             this.currentTime,
             value // Value comes from PropertiesPanel at current time
         );
         this.historyManager.add(command);
         // Command execute will call _addKeyframeInternal
     }

     _addKeyframeInternal(objectUUID, propertyPath, time, value) {
         const layer = this.layers.get(objectUUID);
         if (!layer) return false;

         const keyframe = new Keyframe(time, value);
         layer.addKeyframe(propertyPath, keyframe);

         this.emitTimelineDataChanged(); // Notify UI
         console.log(`Added keyframe for ${layer.objectName}.${propertyPath} at ${time}s`);
         return true;
     }

      _removeKeyframeInternal(objectUUID, propertyPath, time) {
         const layer = this.layers.get(objectUUID);
         if (!layer) return false;

         const removed = layer.removeKeyframeAt(propertyPath, time);
         if (removed) {
            this.emitTimelineDataChanged(); // Notify UI
            console.log(`Removed keyframe for ${layer.objectName}.${propertyPath} at ${time}s`);
         }
         return removed;
      }

     // --- UI Interaction ---
     toggleLayerCollapse(objectUUID) {
         const layer = this.layers.get(objectUUID);
         if (layer) {
             layer.collapsed = !layer.collapsed;
             this.emitTimelineDataChanged(); // Trigger UI redraw for collapse state
         }
     }

     emitTimelineDataChanged() {
        this.eventEmitter.emit('timelineDataChanged', {
            layers: this.getLayersArray(),
            startTime: this.startTime,
            endTime: this.endTime
        });
     }
}