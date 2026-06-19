// B"H
export class InspectorHeader {
  static render() {
    return {
      tag: 'div',
      attr: { className: 'prop-header-bar inspector-header-bar' },
      children: [
        { tag: 'h2', attr: { className: 'inspector-header-title' }, children: 'EFFECT CONTROLS' },
        {
          tag: 'button',
          attr: { className: 'close-btn', title: 'Close Panel' },
          children: 'X',
          events: { click: () => { const p = document.getElementById('prop-panel'); if (p) p.classList.remove('visible'); } }
        }
      ]
    };
  }
}
