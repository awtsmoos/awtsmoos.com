// B"H

/**
 * Embedded velocity curve preview for spatial/action events.
 */
export class GraphEditorSection {
  static render(event) {
    if (!event.pos && !event.actions) return { tag: 'div' };

    return {
      tag: 'div',
      attr: { className: 'graph-editor-panel' },
      children: [
        { tag: 'h4', attr: { className: 'graph-editor-title' }, children: 'VELOCITY CURVE (DOPE SHEET)' },
        {
          tag: 'div',
          attr: { className: 'graph-canvas-wrapper' },
          children: [
            { tag: 'div', attr: { className: 'graph-curve-preview' } },
            { tag: 'div', attr: { className: 'graph-handle graph-handle-start' } },
            { tag: 'div', attr: { className: 'graph-handle graph-handle-end' } }
          ]
        },
        {
          tag: 'div',
          attr: { className: 'graph-editor-labels' },
          children: [
            { tag: 'span', children: 'Ease-In' },
            { tag: 'span', children: 'Ease-Out' }
          ]
        }
      ]
    };
  }
}
