
// B"H
import { Component } from '../../../core/ui/Component.js';
import { TimelineCore } from './TimelineCore.js';
import { ToolbarUI } from './components/ToolbarUI.js';
import { TimeRuler } from './components/TimeRuler.js';
import { NLETracksManager } from './managers/NLETracksManager.js';
import { ScrubManager } from '../interactions/ScrubManager.js';
import { TimelineResizer } from '../resizer/TimelineResizer.js';

export class NLETimelineUI extends Component {
  constructor(state, app) {
    super(state);
    this.app = app;
    this.core = new TimelineCore(state, app.director);
  }

  render() {
    return {
      tag: 'div',
      attr: { className: 'nle-advanced-container', id: 'nle-root' },
      children: [
        {
          tag: 'div',
          attr: { id: 'tl-resize-handle', className: 'nle-supreme-resizer' },
          children: [{ tag: 'div', attr: { className: 'handle-etching' } }]
        },
        { tag: 'div', attr: { id: 'nle-toolbar-mount', className: 'tl-compact-toolbar' } },
        { tag: 'div', attr: { id: 'nle-ruler-mount', className: 'nle-ruler-viewport' } },
        {
          tag: 'div',
          attr: { className: 'nle-tracks-viewport', id: 'nle-viewport' },
          children: [
            { tag: 'div', attr: { id: 'tl-playhead', className: 'nle-playhead' } },
            { tag: 'div', attr: { id: 'nle-track-mount' } }
          ]
        }
      ]
    };
  }

  onMount() {
    this.trackMount = this.element.querySelector('#nle-track-mount');
    const root = this.element.querySelector('#nle-root');
    const handle = this.element.querySelector('#tl-resize-handle');

    TimelineResizer.bind(handle, root);

    const toolbarMount = this.element.querySelector('#nle-toolbar-mount');
    toolbarMount.appendChild(ToolbarUI.render(this.core));
    ToolbarUI.bindStateUpdates(toolbarMount, this.core); 

    ScrubManager.bind(this.element.querySelector('#nle-viewport'), this.core, this.app.state);

    this.state.subscribe('activeSequence', () => this.refreshTracks());

    const updatePlayheadVisuals = (ms) => {
      const ph = this.element.querySelector('#tl-playhead');
      if (ph) {
        const px = this.core.timeToPixels(ms);
        ph.style.transform = `translateX(${200 + px}px)`; 
      }
      ToolbarUI.updateTimer(this.element.querySelector('#tl-timer'), ms);
    };

    this.state.subscribe('director_time', updatePlayheadVisuals);
    this.state.subscribe('nle_scrubbed', updatePlayheadVisuals);
    this.state.subscribe('nle_zoom_changed', () => this.refreshTracks());

    this.refreshTracks();
  }

  refreshTracks() {
    if (!this.trackMount) return;
    this.trackMount.innerHTML = '';
    
    const rulerMount = this.element.querySelector('#nle-ruler-mount');
    if (rulerMount) {
      rulerMount.innerHTML = '';
      rulerMount.appendChild(TimeRuler.render(this.core.duration, this.core));
    }

    NLETracksManager.refresh(this);
    
    const totalPx = this.core.timeToPixels(this.core.duration);
    this.trackMount.style.width = `${200 + totalPx}px`;
  }
}
