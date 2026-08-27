
// B"H
import { Component } from '../../../../core/ui/Component.js';

/**
 * @class SceneJSONEditor
 * @description
 * THE SEMANTIC ACTION EDITOR (Seder HaDibbur).
 * B"H - We have replaced the raw scrolls with a living, action-based interface.
 */
export class SceneJSONEditor extends Component {
  constructor(state, app) {
    super(state);
    this.app = app;
  }

  render() {
    const seq = this.state.get('activeSequence') || { events: [] };
    const events = seq.events || [];

    // Filter events to only show "Speech" and "Camera" as primary actions for the UI
    const speechEvents = events.filter(e => e.type === 'speech');

    return {
      tag: 'div',
      attr: { className: 'action-panel', style: { padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' } },
      children: [
        { tag: 'h3', attr: { style: { color: 'var(--accent-primary)', marginBottom: '1rem', fontSize: '11px' } }, children: 'LIVE_SCRIPT_EDITOR' },
        
        // List of Speech Actions
        {
          tag: 'div',
          attr: { className: 'speech-list', style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
          children: speechEvents.map((ev, i) => ({
            tag: 'div',
            attr: { className: 'entry', style: { background: '#111', padding: '10px', borderRadius: '10px', border: '1px solid #333' } },
            children: [
              { tag: 'div', attr: { style: { fontSize: '9px', color: '#666', marginBottom: '5px' } }, children: `ACTOR: ${ev.id.toUpperCase()} | TIME: ${(ev.start/1000).toFixed(1)}s` },
              { 
                tag: 'textarea', 
                attr: { 
                  className: 'script-input', 
                  dataset: { index: i, type: 'speech' },
                  style: { width: '100%', background: 'transparent', color: '#fff', border: 'none', resize: 'none', outline: 'none', fontSize: '12px' } 
                }, 
                children: ev.speech 
              }
            ]
          }))
        },

        { tag: 'button', attr: { id: 'inject-json-btn', className: 'btn btn-primary', style: { marginTop: '1.5rem', width: '100%' } }, children: 'ACTUALIZE_SCRIPT' }
      ]
    };
  }

  onMount() {
    const btn = this.element.querySelector('#inject-json-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const seq = { ...this.state.get('activeSequence') };
      if (!seq.events) return;

      const inputs = this.element.querySelectorAll('.script-input');
      inputs.forEach(input => {
        const idx = parseInt(input.dataset.index);
        const type = input.dataset.type;
        
        // We find the nth speech event
        let speechIdx = 0;
        for (let j = 0; j < seq.events.length; j++) {
          if (seq.events[j].type === 'speech') {
            if (speechIdx === idx) {
              seq.events[j].speech = input.value;
              break;
            }
            speechIdx++;
          }
        }
      });

      this.state.set('activeSequence', seq);
      this.app.director.play(seq);
      if (this.app.timeline) this.app.timeline.refreshTracks();
      
      console.log('B"H - Script actualized and world recreated.');
    });
  }
}
