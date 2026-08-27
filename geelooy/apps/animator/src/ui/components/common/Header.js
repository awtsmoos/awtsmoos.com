
// B"H
import { Component } from '../../../core/ui/Component.js';

export class Header extends Component {
  render() {
    return {
      tag: 'header',
      attr: { style: { height: '32px', background: '#050505', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 1rem' } },
      children: [
        { tag: 'span', attr: { style: { fontSize: '9px', color: '#444' } }, children: 'CONNECTED_TO_AWTSMOOS_VOID' }
      ]
    };
  }
}
