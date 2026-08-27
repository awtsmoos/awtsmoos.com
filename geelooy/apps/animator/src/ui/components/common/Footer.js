
// B"H
import { Component } from '../../../core/ui/Component.js';

export class Footer extends Component {
  render() {
    return {
      tag: 'footer',
      attr: { style: { height: '24px', background: '#000', borderTop: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 1rem' } },
      children: [
        { tag: 'span', attr: { style: { fontSize: '8px', color: '#222' } }, children: '© 5786 AWTSMOOS_ENGINE v1.0.0' }
      ]
    };
  }
}
