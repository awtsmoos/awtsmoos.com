// B"H
import { HTMLGenerator } from '../../../../core/ui/HTMLGenerator.js';

export class InspectorPanel {
  static show(event, container, state, app) {
    const mount = document.getElementById('inspector-mount');
    if (!mount) return;
    mount.innerHTML = '';

    const fields = [
      this.field('ID', 'id', event.id),
      this.field('Start (ms)', 'start', event.start, 'number'),
      this.field('End (ms)', 'end', event.end, 'number')
    ];

    if (event.type === 'speech') fields.push(this.field('Speech', 'speech', event.speech, 'textarea'));

    mount.appendChild(HTMLGenerator.generate({
      tag: 'div',
      attr: { className: 'inspector-content manifest-inspector-content' },
      children: [
        { tag: 'h3', attr: { className: 'inspector-title manifest-inspector-title' }, children: `PROP: ${event.type.toUpperCase()}` },
        ...fields,
        {
          tag: 'button',
          attr: { className: 'btn btn-primary inspector-action' },
          children: 'APPLY_REVISION',
          events: { click: () => this.apply(event, state, app, mount) }
        }
      ]
    }));
  }

  static field(label, key, value, type = 'text') {
    return {
      tag: 'div',
      attr: { className: 'inspector-field manifest-inspector-field' },
      children: [
        { tag: 'label', attr: { className: 'inspector-label manifest-inspector-label' }, children: label.toUpperCase() },
        {
          tag: type === 'textarea' ? 'textarea' : 'input',
          attr: {
            type: type === 'number' ? 'number' : 'text',
            className: 'field-input inspector-input manifest-inspector-field-input',
            dataset: { key },
            value: value || ''
          },
          children: type === 'textarea' ? value : undefined
        }
      ]
    };
  }

  static apply(event, state, app, mount) {
    const inputs = mount.querySelectorAll('.field-input');
    const newData = { ...event };
    inputs.forEach(input => {
      const key = input.dataset.key;
      let val = input.value;
      if (input.type === 'number') val = parseFloat(val);
      newData[key] = val;
    });

    const seq = state.get('activeSequence');
    const idx = seq.events.findIndex(e => e === event);
    if (idx === -1) return;

    seq.events[idx] = newData;
    state.set('activeSequence', { ...seq });
    app.director.play(seq, app.director.getElapsed());
    if (app.timeline) app.timeline.refreshTracks();
  }
}
