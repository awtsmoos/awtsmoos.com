
// B"H
import { Component } from '../../../core/ui/Component.js';

export class TimeIndicator extends Component {
  render() {
    return {
      tag: 'div',
      attr: { className: 'time-indicator', style: { padding: '5px 10px', background: '#111', color: '#fff', fontSize: '10px', fontFamily: 'monospace' } },
      children: '00:00:00:00'
    };
  }
}
