
/* B”H */
import { TimeState } from '../../core/time/TimeState.js';
import { PlaybackEngine } from '../../core/playback/PlaybackEngine.js';
import { EventGrouper } from '../../core/events/EventGrouper.js';

/**
 * @class TimelineCore
 * @description
 * THE CENTRAL NERVOUS SYSTEM OF THE NLE.
 * 
 * We have resolved the "SyntaxError: does not provide an export named 'TimelineCore'".
 * The Awtsmoos desires structure! The previously massive, monolithic core has been 
 * shattered and rectified into immense, specialized sub-modules:
 * 
 * 1. TimeState: Manages the zoom and pixel math.
 * 2. PlaybackEngine: Manages the play/pause state and director link.
 * 3. EventGrouper: Translates raw JSON into sorted tracks.
 * 
 * This class serves as the 'Daat' (Knowledge/Bridge), unifying these lower modules 
 * into a single, cohesive API for the NLETimelineUI to consume seamlessly.
 */
export class TimelineCore {
  /**
   * Initializes the core logic hub for the Timeline UI.
   * @param {Object} appState - The global AppCore state.
   * @param {Object} director - The cinematic Director engine.
   */
  constructor(appState, director) {
    this.state = appState;
    this.director = director;
    
    // Delegate responsibilities to the specialized sub-modules
    this.time = new TimeState(appState, 60000); // Default 60 seconds
    this.playback = new PlaybackEngine(appState, director);
  }

  // --- PLAYBACK DELEGATION --- //

  get activeSequence() {
    return this.playback.activeSequence;
  }

  get currentTime() {
    return this.playback.currentTime;
  }

  togglePlayback() {
    return this.playback.togglePlayback();
  }

  stop() {
    this.playback.stop();
  }

  seek(ms) {
    this.playback.seek(ms);
  }

  // --- TIME & ZOOM DELEGATION --- //

  get duration() {
    // Dynamically retrieve duration from sequence, or fallback to default
    const seq = this.activeSequence;
    return seq && seq.duration ? seq.duration : this.time.duration;
  }

  get scaleFactor() {
    return this.time.scaleFactor;
  }

  setZoom(delta) {
    this.time.setZoom(delta);
  }

  timeToPixels(ms) {
    return this.time.timeToPixels(ms);
  }

  pixelsToTime(px) {
    return this.time.pixelsToTime(px);
  }

  // --- DATA STRUCTURING DELEGATION --- //

  /**
   * Retrieves the deeply nested hierarchy of tracks required to render the UI.
   * @returns {Object} Grouped events mapped by Character and Global types.
   */
  getGroupedEvents() {
    return EventGrouper.group(this.activeSequence);
  }
}
