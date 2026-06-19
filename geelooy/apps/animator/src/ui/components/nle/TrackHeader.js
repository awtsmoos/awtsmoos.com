
// B"H
import { Component } from '../../../core/ui/Component.js';

export class TrackHeader extends Component {
  render() {
    const { name } = this.props;
    return {
      tag: 'div',
      attr: { className: 'track-header', style: { width: '150px', height: '40px', borderBottom: '1px solid #222', padding: '10px', fontSize: '11px', color: '#888' } },
      children: name
    };
  }
}
