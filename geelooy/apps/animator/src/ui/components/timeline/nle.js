
// B"H

/**
 * @file nle.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER 5: THE ARENA OF CHRONOS (Ulam HaZman)
 * THE SUBSCRIPTION LEAK RECTIFICATION
 * ═══════════════════════════════════════════════════════════════
 *
 * "For everything there is a season, and a time for every purpose
 *  under the heavens." — Koheles 3:1
 *
 * THE BUG OF THE INFINITE SUBSCRIBERS:
 * The old attach() method subscribed to 'timeline_updated' and
 * then re-called itself from within the callback. Every update
 * added ANOTHER subscriber. After 10 updates: 10 handlers firing.
 * After 100 updates: 100 handlers firing. The browser froze.
 * This was the Subscription Leak — the Sitra Achra of event systems.
 *
 * THE POEM OF THE LEAKING SUBSCRIPTIONS:
 * Each time the timeline changed, a new listener was born,
 * Ten renders for one update — the UI was torn!
 * A hundred subscribers all screaming at once,
 * The browser collapsed like a digital dunce!
 * Now we subscribe ONCE and render inside,
 * The leak is sealed, and the chaos has died!
 *
 * RECTIFICATION:
 *   - subscribe() is called exactly ONCE inside attach().
 *   - The callback only calls _renderIntoContainer(), never attach() again.
 *   - A _subscribed flag prevents any possibility of double-subscription.
 *
 * @class NLETimeline
 */
export class NLETimeline {
  /**
   * @constructor
   * @param {Object} app - The AppCore universe.
   */
  constructor(app) {
    this.app      = app;
    this.state    = app.state;
    this.tracks   = [
      { id: 'camera', label: 'Camera',         clips: [{ name: 'Zoom In',     start: 0,   duration: 400 }] },
      { id: 'main',   label: 'Main Character', clips: [{ name: 'Walk & Talk', start: 0,   duration: 800 }] },
      { id: 'friend', label: 'Friend',         clips: [{ name: 'Enter Stage', start: 600, duration: 400 }] }
    ];
    this.currentTime = 0;
    this.duration    = 15000;
    this.zoom        = 1;

    /** @type {HTMLElement|null} The container this timeline is mounted in. */
    this._container = null;

    /**
     * @type {boolean}
     * @description Guard: ensures we subscribe to state exactly once.
     */
    this._subscribed = false;
  }

  /**
   * @function addKeyframe
   * @description Adds a new keyframe clip to the specified track.
   * @param {string} trackId - The target track id.
   * @param {Object} data    - Keyframe payload data.
   * @returns {void}
   */
  addKeyframe(trackId, data) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) {
      track.clips.push({ name: 'Keyframe', start: this.currentTime, duration: 100, data });
      // Notify state — our subscriber will re-render safely.
      this.app.state.set('timeline_updated', Date.now());
    }
  }

  /**
   * @function _buildHTML
   * @description Produces the full timeline HTML string from current state.
   * @returns {string} The raw HTML string.
   * @private
   */
  _buildHTML() {
    return `
      <div class="nle-timeline">
        <div class="timeline-toolbar">
          <button id="tl-play" class="btn btn-icon" style="background:var(--accent-primary);color:#000;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:none;">▶</button>
          <button id="tl-stop" class="btn btn-icon" style="background:var(--bg-primary);border:1px solid var(--border-color);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;">■</button>
          <div class="time-display" style="font-family:var(--font-mono);font-size:0.7rem;margin-left:1rem;">${(this.currentTime / 1000).toFixed(2)}s</div>
          <div style="flex:1"></div>
          <button id="add-clip-btn" class="btn btn-sm" style="font-size:0.6rem;">+ ADD_CLIP</button>
        </div>
        <div class="tracks-container" style="position:relative;overflow-x:auto;">
          <div class="playhead" style="position:absolute;top:0;bottom:0;width:2px;background:var(--accent-primary);z-index:10;pointer-events:none;left:120px;"></div>
          ${this.tracks.map(track => `
            <div class="track" data-track-id="${track.id}" style="display:flex;border-bottom:1px solid var(--border-color);height:40px;">
              <div class="track-header" style="width:120px;background:var(--bg-secondary);padding:0.5rem;font-size:0.6rem;border-right:1px solid var(--border-color);">${track.label}</div>
              <div class="track-content" style="flex:1;position:relative;background:rgba(255,255,255,0.02);">
                ${track.clips.map(clip => `
                  <div class="clip" style="position:absolute;left:${clip.start / 10}px;width:${clip.duration / 10}px;height:80%;top:10%;background:var(--accent-primary);color:#000;font-size:0.5rem;padding:2px;border-radius:4px;overflow:hidden;">
                    ${clip.name}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * @function _renderIntoContainer
   * @description
   * Re-renders the timeline HTML into the container WITHOUT re-attaching
   * any event listeners or re-subscribing to state. This is the SAFE
   * internal re-render called by the state subscription.
   *
   * @returns {void}
   * @private
   */
  _renderIntoContainer() {
    if (!this._container) return;
    this._container.innerHTML = this._buildHTML();
    this._bindDOMEvents(this._container);
  }

  /**
   * @function _bindDOMEvents
   * @description Attaches all DOM event listeners to the freshly rendered HTML.
   * Called after every re-render. Does NOT subscribe to state again.
   *
   * @param {HTMLElement} container - The timeline mount point.
   * @returns {void}
   * @private
   */
  _bindDOMEvents(container) {
    const playBtn  = container.querySelector('#tl-play');
    const stopBtn  = container.querySelector('#tl-stop');
    const playhead = container.querySelector('.playhead');
    const tracks   = container.querySelector('.tracks-container');
    const timeDisp = container.querySelector('.time-display');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const isPlaying = !this.app.director.isPlaying;
        if (isPlaying) {
          this.app.director.play(this.app.state.get('activeSequence'));
          playBtn.innerText = '⏹';
        } else {
          this.app.director.isPlaying = false;
          playBtn.innerText = '▶';
        }
      });
    }

    if (tracks && playhead) {
      tracks.addEventListener('click', (e) => {
        const rect = tracks.getBoundingClientRect();
        const x = e.clientX - rect.left - 120;
        if (x >= 0) {
          const percent = x / (tracks.offsetWidth - 120);
          this.currentTime = percent * this.duration;
          playhead.style.left = `${x + 120}px`;
          if (timeDisp) timeDisp.innerText = `${(this.currentTime / 1000).toFixed(2)}s`;
        }
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.app.director.isPlaying = false;
        if (playBtn) playBtn.innerText = '▶';
        if (playhead) playhead.style.left = '120px';
        this.currentTime = 0;
        if (timeDisp) timeDisp.innerText = `0.00s`;
      });
    }
  }

  /**
   * @function attach
   * @description
   * Mounts the NLE timeline into the given container DOM element.
   * Performs an initial render and subscribes to state EXACTLY ONCE.
   *
   * @param {HTMLElement} container - The DOM element to mount into.
   * @returns {void}
   */
  attach(container) {
    if (!container) return;
    this._container = container;

    // Initial render.
    this._renderIntoContainer();

    // Subscribe to director time updates for playhead movement.
    // This does NOT call attach() again — it only updates the playhead DOM.
    this.app.state.subscribe('director_time', (t) => {
      const playhead = this._container?.querySelector('.playhead');
      const timeDisp = this._container?.querySelector('.time-display');
      const tracks   = this._container?.querySelector('.tracks-container');
      if (!playhead || !tracks) return;
      const percent = t / this.duration;
      playhead.style.left = `${120 + percent * (tracks.offsetWidth - 120)}px`;
      if (timeDisp) timeDisp.innerText = `${(t / 1000).toFixed(2)}s`;
    });

    // RECTIFICATION: Subscribe to 'timeline_updated' EXACTLY ONCE.
    // We call _renderIntoContainer() — NOT attach() — inside the callback.
    if (!this._subscribed) {
      this._subscribed = true;
      this.app.state.subscribe('timeline_updated', () => {
        this._renderIntoContainer();
      });
    }
  }
}
