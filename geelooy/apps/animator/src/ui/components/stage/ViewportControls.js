
// B"H
import { Component } from '../../../core/ui/Component.js';

export class ViewportControls extends Component {
  render() {
    return {
      tag: 'div',
      attr: { className: 'viewport-controls', style: { position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px' } },
      children: [
        { tag: 'button', attr: { className: 'vp-btn' }, children: 'ZOOM_IN' },
        { tag: 'button', attr: { className: 'vp-btn' }, children: 'RESET' }
      ]
    };
  }
}
