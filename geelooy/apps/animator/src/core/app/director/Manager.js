/* B”H */
import { DirectorCore } from './logic/Core.js';
import { EventProcessor } from './logic/EventProcessor.js';

/**
 * @file Manager.js
 * @description
 * Chapter: The timeline stopped dragging yesterday through today.
 * The director now evaluates events in stable layer order, cleans ended events
 * before applying current ones, and loops without carrying old active objects
 * into the new cycle. This makes walking, speech, camera, and props obey the
 * same clean clock instead of fighting through stale cleanup.
 */
export class Director extends DirectorCore {
  constructor(app) {
    super(app);
    this.lastMs = 0;
    this.activeEvents = new Set();
    this.playbackRate = 0.78;
    this.lastLoopIndex = 0;
  }

  /** @param {Object} sequence @param {number} startOffsetMs @returns {void} */
  play(sequence, startOffsetMs = 0) {
    this.sequence = this.prepareSequence(sequence);
    this.startTime = performance.now() - startOffsetMs / this.playbackRate;
    this.lastMs = startOffsetMs;
    this.activeEvents.clear();
    this.isPlaying = true;
    console.log(`B"H - [Director] Time flows from ${startOffsetMs}ms.`);
  }

  /** @param {number} ms - Timeline ms. @returns {void} */
  seek(ms) {
    this.startTime = performance.now() - ms / this.playbackRate;
    this.lastMs = ms;
    this.activeEvents.clear();
    this.update(true);
  }

  /** @returns {number} Elapsed director ms. */
  getElapsed() {
    if (!this.isPlaying) return this.lastMs;
    return (performance.now() - this.startTime) * this.playbackRate;
  }

  /** @param {boolean} force - Force update while paused. @returns {void} */
  update(force = false) {
    if ((!this.isPlaying || !this.sequence) && !force) return;
    const duration = Math.max(1, Number(this.sequence.duration || 60000));
    const absoluteMs = this.getElapsed();
    const loopIndex = Math.floor(Math.max(0, absoluteMs) / duration);
    const loopMs = this.resolveLoopMs(absoluteMs, duration, loopIndex);

    if (loopIndex !== this.lastLoopIndex) this.activeEvents.clear();
    this.lastLoopIndex = loopIndex;
    this.lastMs = loopMs;
    this.app.state.set('director_time', loopMs, true);

    const currentlyActive = new Set(this.activeAt(loopMs));
    this.cleanupEnded(currentlyActive);
    this.applyEvents(currentlyActive, loopMs);
    this.activeEvents = currentlyActive;
  }

  /** @param {Object} sequence - Sequence. @returns {Object} Prepared sequence. */
  prepareSequence(sequence = {}) {
    return {
      ...sequence,
      events: [...(sequence.events || [])].sort((a, b) => this.order(a) - this.order(b) || (a.start || 0) - (b.start || 0))
    };
  }

  /** @param {number} absoluteMs @param {number} duration @param {number} loopIndex @returns {number} */
  resolveLoopMs(absoluteMs, duration, loopIndex) {
    if (absoluteMs <= duration) return Math.max(0, absoluteMs);
    if (!this.isPlaying) return duration;
    return absoluteMs - loopIndex * duration;
  }

  /** @param {number} loopMs - Current loop ms. @returns {Array<Object>} */
  activeAt(loopMs) {
    return (this.sequence.events || []).filter((event) => loopMs >= event.start && loopMs <= event.end);
  }

  /** @param {Set<Object>} currentlyActive - Active event set. @returns {void} */
  cleanupEnded(currentlyActive) {
    this.activeEvents.forEach((event) => {
      if (!currentlyActive.has(event)) EventProcessor.cleanup(this, event);
    });
  }

  /** @param {Set<Object>} currentlyActive @param {number} loopMs @returns {void} */
  applyEvents(currentlyActive, loopMs) {
    [...currentlyActive]
      .sort((a, b) => this.order(a) - this.order(b) || (a.start || 0) - (b.start || 0))
      .forEach((event) => {
        const eventDuration = Math.max(1, (event.end || 0) - (event.start || 0));
        const t = Math.max(0, Math.min(1, (loopMs - (event.start || 0)) / eventDuration));
        EventProcessor.process(this, event, t, loopMs);
      });
  }

  /** @param {Object} event - Event. @returns {number} Layer order. */
  order(event = {}) {
    const map = { camera: 0, character: 1, action: 1, speech: 2, prop: 3, interact: 4, custom_macro: 5 };
    return map[event.type] ?? 9;
  }

  /** @returns {Object} Default character. */
  getDefaultChar() {
    return {
      position: { x: 0, y: 0, scale: 0.9 },
      view: 'front',
      colors: { skin: '#ffdbac', clothes: '#ff0000' },
      hatType: 'none',
      beard: 'none',
      mouthOpen: 0,
      isTalking: false,
      speech: null
    };
  }
}
