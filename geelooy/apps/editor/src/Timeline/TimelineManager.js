// B"H
import { Layer } from './Layer.js';
import { Animator } from './Animator.js';
import { Keyframe } from './Keyframe.js';
import { AddKeyframeCommand } from '../History/Commands/KeyframeCommand.js';
// ** Import the new RemoveKeyframeCommand **
import { RemoveKeyframeCommand } from '../History/Commands/RemoveKeyframeCommand.js';

export class TimelineManager {
    constructor(eventEmitter, objectManager, historyManager) {
        this.eventEmitter = eventEmitter;
        this.objectManager = objectManager;
        this.historyManager = historyManager; // This must be a valid HistoryManager instance

        this.layers = new Map();
        this.animator = new Animator(this.objectManager);

        this.currentTime = 0;
        this.startTime = 0;
        this.endTime = 10;
        this.isPlaying = false;
        this.isScrubbing = false;

        // ** FIX: Ensure all event listeners are correctly bound to 'this' **
        this.eventEmitter.on('objectAdded', this.handleObjectAdded.bind(this));
        this.eventEmitter.on('objectRemoved', this.handleObjectRemoved.bind(this));
        this.eventEmitter.on('seekTimeline', this.seek.bind(this));
        this.eventEmitter.on('playTimeline', this.play.bind(this));
        this.eventEmitter.on('pauseTimeline', this.pause.bind(this));
        this.eventEmitter.on('createKeyframeRequest', this.handleCreateKeyframeRequest.bind(this));
        this.eventEmitter.on('toggleLayerCollapse', this.toggleLayerCollapse.bind(this));
        
        console.log('B\"H\n - TimelineManager Initialized');
    }
    
    /**
     * Handles requests to create OR delete keyframes from the Properties Panel.
     */
    handleCreateKeyframeRequest({ objectUUID, propertyPath, value }) {
        // ** FIX: The crash was because this.historyManager was not correctly referenced. **
        // The .bind(this) in the constructor solves this.
        if (!this.historyManager) {
            console.error("HistoryManager is missing in TimelineManager!");
            return;
        }

        const layer = this.layers.get(objectUUID);
        if (!layer) return;

        const existingKeyframe = layer.getTrack(propertyPath)?.getKeyframeAt(this.currentTime);

        if (existingKeyframe) {
            // ** FEATURE: If a keyframe exists, create a command to REMOVE it. **
            const command = new RemoveKeyframeCommand(this, objectUUID, propertyPath, this.currentTime, existingKeyframe.value);
            this.historyManager.add(command);
        } else {
            // ** If no keyframe exists, create a command to ADD one. **
            const command = new AddKeyframeCommand(this, objectUUID, propertyPath, this.currentTime, value);
            this.historyManager.add(command);
        }
    }

    // --- Internal methods called by commands ---
     _addKeyframeInternal(objectUUID, propertyPath, time, value) {
         const layer = this.layers.get(objectUUID);
         if (!layer) return false;
         const keyframe = new Keyframe(time, value);
         layer.addKeyframe(propertyPath, keyframe);
         this.emitTimelineDataChanged();
         return true;
     }

      _removeKeyframeInternal(objectUUID, propertyPath, time) {
         const layer = this.layers.get(objectUUID);
         if (!layer) return false;
         const removed = layer.removeKeyframeAt(propertyPath, time);
         if (removed) {
            this.emitTimelineDataChanged();
         }
         return removed;
      }
      
    // --- All other methods from previous steps remain the same ---
    getLayersArray() { return Array.from(this.layers.values()); }
    handleObjectAdded(object) { object.traverse((obj) => { if (obj.userData?.isSelectable) this.createLayerForObject(obj); }); }
    handleObjectRemoved(object) { object.traverse((obj) => { if (this.layers.has(obj.uuid)) this.removeLayerForObject(obj); }); }
    createLayerForObject(object) { if (!object || this.layers.has(object.uuid)) return; const layer = new Layer(object.uuid, object.name); this.layers.set(object.uuid, layer); this.animator.setLayers(this.getLayersArray()); this.emitTimelineDataChanged(); }
    removeLayerForObject(object) { if (object && this.layers.has(object.uuid)) { this.layers.delete(object.uuid); this.animator.setLayers(this.getLayersArray()); this.emitTimelineDataChanged(); } }
    getLayer(objectUUID) { return this.layers.get(objectUUID); }
    play() { if (this.isPlaying) return; this.isPlaying = true; if (this.currentTime >= this.endTime) this.currentTime = this.startTime; this.eventEmitter.emit('playbackStateChanged', { isPlaying: true }); }
    pause() { if (!this.isPlaying) return; this.isPlaying = false; this.eventEmitter.emit('playbackStateChanged', { isPlaying: false }); }
    seek(time, isScrubbing = false) { this.currentTime = Math.max(this.startTime, Math.min(this.endTime, time)); this.isScrubbing = isScrubbing; this.animator.update(this.currentTime); this.eventEmitter.emit('timeChanged', { currentTime: this.currentTime, isScrubbing }); }
    update(appTime, deltaTime) { if (this.isPlaying && !this.isScrubbing) { let newTime = this.currentTime + deltaTime; if (newTime > this.endTime) newTime = this.startTime; this.seek(newTime); } }
    toggleLayerCollapse(objectUUID) { const layer = this.layers.get(objectUUID); if (layer) { layer.collapsed = !layer.collapsed; this.emitTimelineDataChanged(); } }
    emitTimelineDataChanged() { this.eventEmitter.emit('timelineDataChanged', { layers: this.getLayersArray(), startTime: this.startTime, endTime: this.endTime }); }
}