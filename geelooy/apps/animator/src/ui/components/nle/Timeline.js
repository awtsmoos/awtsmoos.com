
// B"H
/**
 * @file Timeline.js
 * @description
 * ═══════════════════════════════════════════════════════════════
 * CHAPTER: THE RIVER OF TIME (Nahar HaZman)
 * ═══════════════════════════════════════════════════════════════
 * 
 * RECTIFICATION (The Updated Pointer):
 * Updates the import path for `NLEDragManager` following the Great 
 * Shattering of the interactions folder.
 */

import { ScrubManager } from '../../../nle/ui/interactions/ScrubManager.js';
import { ClipSelector } from '../../../nle/ui/interactions/ClipSelector.js';
import { NLEDragManager } from '../../../nle/ui/interactions/drag/NLEDragManager.js';
import { TimelineCore } from '../../../nle/ui/manifest/TimelineCore.js';
import { NLETracksManager } from '../../../nle/ui/manifest/managers/NLETracksManager.js';
import { TimeRuler } from '../../../nle/ui/manifest/components/TimeRuler.js';

export class Timeline {
  constructor(state, app) {
    this.state = state;
    this.app = app;
    this.element = null;
    this._rafHandle = null;
    
    this.core = new TimelineCore(state, app.director);
    this._mount();
  }

  _mount() {
    const mount = document.getElementById('nle-timeline');
    if (!mount) {
      requestAnimationFrame(() => this._mount());
      return;
    }
    this.element = mount;
    this._render();
  }

  _render() {
    const mount = this.element;
    if (!mount) return;

    mount.innerHTML = `
      <div class="nle-container" style="display:flex; flex-direction:column; height:100%; background:#08080c; overflow:hidden;">
        <div class="nle-toolbar"
          style="display:flex; align-items:center; gap:8px; padding:0 12px; height:38px;
                 border-bottom:1px solid #111; flex-shrink:0; background:#050508;">
          <button id="nle-play-btn"
            style="background:#0a0a10; border:1px solid #222; color:#aaa; width:26px; height:26px;
                   border-radius:50%; cursor:pointer; font-size:11px; display:flex;
                   align-items:center; justify-content:center; transition:all 0.2s;">▶</button>
          <button id="nle-stop-btn"
            style="background:#0a0a10; border:1px solid #1a1a1a; color:#444; width:26px; height:26px;
                   border-radius:50%; cursor:pointer; font-size:11px; display:flex;
                   align-items:center; justify-content:center;">■</button>
          <div id="nle-time-display"
            style="font-family:monospace; font-size:9px; color:#444; min-width:55px; letter-spacing:1px;">
            0.000s
          </div>
          <div style="flex:1;"></div>
          <div id="timeline-toggle" class="timeline-toggle"
            style="cursor:pointer; font-size:8px; color:#333; padding:4px 8px;
                   letter-spacing:1px; user-select:none;">
            ▼ NLE
          </div>
        </div>

        <div id="nle-ruler-mount"
          style="height:18px; background:#040407; border-bottom:1px solid #0a0a0a;
                 flex-shrink:0; position:relative; overflow:hidden;">
        </div>

        <div id="nle-viewport"
          style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative;">
          
          <div id="tl-playhead" class="nle-playhead" style="position: absolute; top:0; bottom:0; width:2px; background:red; z-index:900; pointer-events:none;"></div>
          
          <div id="nle-track-mount" style="position: relative; padding-bottom: 20px;">
          </div>
        </div>
      </div>
    `;

    this.trackMount = this.element.querySelector('#nle-track-mount');
    this.rulerMount = this.element.querySelector('#nle-ruler-mount');

    this._bindControls();

    const viewport = mount.querySelector('#nle-viewport');
    
    ScrubManager.bind(viewport, this.core, this.state);
    ClipSelector.bind(viewport, this.state, this.app);
    NLEDragManager.bind(viewport, this.core, this.state, this.app);

    this.state.subscribe('activeSequence', () => this.refreshTracks());
    this.state.subscribe('nle_zoom_changed', () => this.refreshTracks());

    const updatePlayheadVisuals = (ms) => {
      const ph = this.element.querySelector('#tl-playhead');
      if (ph) {
        const px = this.core.timeToPixels(ms);
        ph.style.transform = `translateX(${200 + px}px)`; 
      }
    };

    this.state.subscribe('director_time', updatePlayheadVisuals);
    this.state.subscribe('nle_scrubbed', updatePlayheadVisuals);

    this._startPlayheadUpdate();
    this.refreshTracks();
  }

  _bindControls() {
    const playBtn = this.element.querySelector('#nle-play-btn');
    const stopBtn = this.element.querySelector('#nle-stop-btn');

    const updatePlayBtn = (isPlaying) => {
      if (!playBtn) return;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      playBtn.style.color = isPlaying ? '#00ffcc' : '#aaa';
      playBtn.style.borderColor = isPlaying ? '#00ffcc44' : '#222';
    };

    this.state.subscribe('isPlaying', updatePlayBtn);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const isPlaying = this.core.togglePlayback();
        this.state.set('isPlaying', isPlaying);
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.core.stop();
        this.state.set('isPlaying', false);
      });
    }
  }

  _startPlayheadUpdate() {
    if (this._rafHandle) cancelAnimationFrame(this._rafHandle);
    const display = this.element.querySelector('#nle-time-display');

    const tick = () => {
      if (!this.element || !this.element.isConnected) return;
      if (display && this.app && this.app.director) {
        const ms = this.app.director.getElapsed();
        display.textContent = (ms / 1000).toFixed(3) + 's';
      }
      this._rafHandle = requestAnimationFrame(tick);
    };

    this._rafHandle = requestAnimationFrame(tick);
  }

  refreshTracks() {
    if (!this.trackMount || !this.rulerMount) return;
    
    this.trackMount.innerHTML = '';
    this.rulerMount.innerHTML = '';

    NLETracksManager.refresh({
      core: this.core,
      trackMount: this.trackMount,
      state: this.state,
      app: this.app
    });

    this.rulerMount.appendChild(TimeRuler.render(this.core.duration, this.core));

    const totalPx = this.core.timeToPixels(this.core.duration);
    this.trackMount.style.width = `${200 + totalPx + 100}px`; 
  }
}
