// B"H
import { HTMLGenerator } from '../../core/ui/HTMLGenerator.js';

/**
 * Property inspector rendered through semantic classes only.
 */
export class PropertyInspector {
  /**
   * Shows one event for editing.
   *
   * @param {Object} event - Sequence event.
   * @param {Object} state - App state.
   * @param {Object} app - App core.
   * @returns {void}
   */
  static inspect(event, state, app) {
    const mount = document.getElementById('inspector-mount');
    if (!mount) return;

    mount.innerHTML = '';
    mount.appendChild(HTMLGenerator.generate(this.schema(event, state, app, mount)));
  }

  /**
   * Creates the inspector schema.
   *
   * @param {Object} event - Sequence event.
   * @param {Object} state - App state.
   * @param {Object} app - App core.
   * @param {Element} mount - Inspector mount.
   * @returns {Object} HTMLGenerator schema.
   */
  static schema(event, state, app, mount) {
    return {
      tag: 'div',
      attr: { className: 'inspector-content' },
      children: [
        { tag: 'h3', attr: { className: 'inspector-title' }, children: `PROP: ${event.type.toUpperCase()}` },
        ...this.fields(event),
        this.applyButton(event, state, app, mount),
        this.deleteButton(event, state, app, mount)
      ]
    };
  }

  /**
   * Builds all fields for a sequence event.
   *
   * @param {Object} event - Sequence event.
   * @returns {Array<Object>} Field schemas.
   */
  static fields(event) {
    const fields = [
      this.field('ID', 'id', event.id),
      this.field('Start (ms)', 'start', event.start, 'number'),
      this.field('End (ms)', 'end', event.end, 'number')
    ];

    const extra = {
      speech: () => fields.push(this.field('Speech', 'speech', event.speech, 'textarea')),
      scene_change: () => fields.push(this.field('Scene Type', 'sceneType', event.sceneType)),
      camera: () => {
        fields.push(this.field('Shot Type', 'shotType', event.shotType));
        fields.push(this.field('Target', 'target', event.target));
      }
    };

    if (extra[event.type]) extra[event.type]();
    return fields;
  }

  /**
   * Builds one input field.
   *
   * @param {string} label - Visible label.
   * @param {string} key - Data key.
   * @param {*} value - Current value.
   * @param {string} type - Input type.
   * @returns {Object} Field schema.
   */
  static field(label, key, value, type = 'text') {
    return {
      tag: 'div',
      attr: { className: 'inspector-field' },
      children: [
        { tag: 'label', attr: { className: 'inspector-label' }, children: label.toUpperCase() },
        {
          tag: type === 'textarea' ? 'textarea' : 'input',
          attr: {
            type: type === 'number' ? 'number' : 'text',
            className: 'field-input inspector-input',
            dataset: { key },
            value: value || ''
          },
          children: type === 'textarea' ? value : undefined
        }
      ]
    };
  }

  /**
   * Builds the apply button.
   *
   * @returns {Object} Button schema.
   */
  static applyButton(event, state, app, mount) {
    return {
      tag: 'button',
      attr: { className: 'btn btn-primary inspector-action' },
      children: 'APPLY_REVISION',
      events: { click: () => this.apply(event, state, app, mount) }
    };
  }

  /**
   * Builds the delete button.
   *
   * @returns {Object} Button schema.
   */
  static deleteButton(event, state, app, mount) {
    return {
      tag: 'button',
      attr: { className: 'btn inspector-action inspector-delete' },
      children: 'DELETE_FROM_TIMELINE',
      events: { click: () => this.delete(event, state, app, mount) }
    };
  }

  /**
   * Applies form edits.
   *
   * @returns {void}
   */
  static apply(event, state, app, mount) {
    const newData = { ...event };
    mount.querySelectorAll('.field-input').forEach(input => {
      newData[input.dataset.key] = input.type === 'number' ? parseFloat(input.value) : input.value;
    });

    const seq = state.get('activeSequence');
    const idx = seq.events.findIndex(e => e === event);
    if (idx === -1) return;

    seq.events[idx] = newData;
    state.set('activeSequence', { ...seq });
    app.director.play(seq, app.director.getElapsed());
    if (app.timeline) app.timeline.refreshTracks();
  }

  /**
   * Deletes the inspected event.
   *
   * @returns {void}
   */
  static delete(event, state, app, mount) {
    const seq = state.get('activeSequence');
    seq.events = seq.events.filter(e => e !== event);
    state.set('activeSequence', { ...seq });
    app.director.play(seq);
    if (app.timeline) app.timeline.refreshTracks();
    mount.innerHTML = '<p class="inspector-empty">Vessel returned to Void.</p>';
  }
}
