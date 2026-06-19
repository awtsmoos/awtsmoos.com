
// B"H
import { Component } from '../../../core/ui/Component.js';

export class InspectorPanel extends Component {
  render() {
    return {
      tag: 'div',
      attr: { className: 'inspector-panel', style: { padding: '1rem', borderTop: '1px solid #222' } },
      children: [
        { tag: 'h5', attr: { style: { fontSize: '10px', color: '#444' } }, children: 'GEOMETRY_INSPECTOR' },
        { tag: 'div', attr: { className: 'inspector-specs', style: { fontSize: '9px', marginTop: '10px' } }, children: 'No entity selected.' }
      ]
    };
  }
}
