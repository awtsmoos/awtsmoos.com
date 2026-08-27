// B"H
export class InspectorInfo {
  static render(event) {
    return {
      tag: 'div',
      attr: { className: 'prop-row inspector-info-row' },
      children: `TARGET: ${event.id || 'GLOBAL'} | TYPE: ${(event.type || '').toUpperCase()}`
    };
  }
}
