// B"H
export class InspectorInput {
  static render(label, value, onChange) {
    return {
      tag: 'div',
      attr: { className: 'manifest-inspector-input-row' },
      children: [
        { tag: 'span', attr: { className: 'manifest-inspector-input-label' }, children: label },
        {
          tag: 'input',
          attr: { type: 'number', value, step: 'any', className: 'manifest-inspector-number-input' },
          events: { change: e => onChange(e.target.value) }
        }
      ]
    };
  }
}
