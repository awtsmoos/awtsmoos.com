// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';

export class ToolbarUI {
  static render(core) {
    const isPlaying = core.state.get('isPlaying') || false;

    return HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'nle-toolbar-inner' },
      children: [
        {
          tag: 'button',
          attr: { id: 'tl-play-btn', className: 'btn btn-sm btn-primary nle-play-button' },
          children: isPlaying ? '⏸' : '▶',
          events: { click: () => core.state.set('isPlaying', core.togglePlayback()) }
        },
        { tag: 'div', attr: { id: 'tl-timer', className: 'time-readout nle-time-readout' }, children: '0.00s' },
        { tag: 'div', attr: { className: 'nle-toolbar-separator' } },
        {
          tag: 'div',
          attr: { className: 'nle-toolbar-zoom' },
          children: [
            { tag: 'button', attr: { className: 'btn btn-sm' }, children: '−', events: { click: () => core.setZoom(-0.2) } },
            { tag: 'button', attr: { className: 'btn btn-sm' }, children: '+', events: { click: () => core.setZoom(0.2) } }
          ]
        },
        { tag: 'div', attr: { className: 'nle-toolbar-spacer' } },
        {
          tag: 'button',
          attr: { className: 'btn btn-sm btn-primary nle-add-actor-button' },
          children: '👤 ACTOR',
          events: { click: () => this.addActor(core) }
        },
        {
          tag: 'button',
          attr: { className: 'btn btn-sm btn-primary nle-add-prop-button' },
          children: '📦 PROP',
          events: { click: () => this.addProp(core) }
        }
      ]
    });
  }

  static addActor(core) {
    const id = prompt('Character ID:', 'soul_' + Date.now().toString().slice(-4));
    if (!id) return;
    const style = prompt('Style (realistic, illustrated_sage):', 'realistic') || 'realistic';
    const chars = core.state.get('characters') || {};
    chars[id] = {
      id,
      style,
      position: { x: 0, y: 0 },
      view: 'front',
      colors: { skin: '#ffdbac', clothes: '#333333', hair: '#111111' },
      hairType: 'standard',
      hatType: 'none'
    };
    core.state.set('characters', chars);

    const seq = core.state.get('activeSequence');
    seq.events.push({ type: 'character', id, start: core.currentTime, end: core.currentTime + 5000, pos: { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } } });
    core.state.set('activeSequence', seq);
    if (core.app && core.app.timeline) core.app.timeline.refreshTracks();
  }

  static addProp(core) {
    const type = prompt('Prop Type (cup, sword, scissors, plant, phone, etc):', 'cup');
    if (!type) return;
    const id = type + '_' + Date.now().toString().slice(-3);
    const seq = core.state.get('activeSequence');
    seq.events.push({ type: 'prop', id, propType: type, action: 'spawn', start: core.currentTime, end: core.currentTime + 8000, x: 0, y: 60, scale: 1.0 });
    core.state.set('activeSequence', seq);
    if (core.app && core.app.timeline) core.app.timeline.refreshTracks();
  }

  static bindStateUpdates(element, core) {
    core.state.subscribe('isPlaying', playing => {
      const btn = element.querySelector('#tl-play-btn');
      if (btn) btn.innerText = playing ? '⏸' : '▶';
    });
  }

  static updateTimer(element, ms) {
    if (element) element.innerText = (ms / 1000).toFixed(2) + 's';
  }
}
