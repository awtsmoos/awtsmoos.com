// B"H
import { Component } from '../../../core/ui/Component.js';

/**
 * @file RangeController.js
 */
export class RangeController extends Component {
  render() {
    const { label, key, min, max, step, value, onChange } = this.props;
    return {
      tag: 'div',
      attr: { className: 'ctrl-range', style: { marginBottom: '1.5rem' } },
      children: [
        { tag: 'div', attr: { style: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', color: '#888' } }, children: [
          { tag: 'span', children: label },
          { tag: 'span', attr: { className: `val-${key}` }, children: typeof value === 'number' ? value.toFixed(2) : value }
        ]},
        {
          tag: 'input',
          attr: {
            type: 'range', min, max, step, value,
            style: { 
              width: '100%', height: '44px', margin: '0', accentColor: '#ffffff', 
              cursor: 'pointer', appearance: 'none', background: '#222', borderRadius: '4px'
            }
          },
          events: {
            input: (e) => {
              const val = parseFloat(e.target.value);
              const valDisplay = this.element.querySelector(`.val-${key}`);
              if (valDisplay) valDisplay.innerText = val.toFixed(2);
              if (onChange) onChange(val);
            }
          }
        }
      ]
    };
  }
}
