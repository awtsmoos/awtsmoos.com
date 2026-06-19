// B"H
import { Component } from '../../../core/ui/Component.js';

/**
 * @class SoulController
 * @description
 * THE SLIDERS OF THE SOUL (Achidat HaNeshama).
 * B"H - Renders a set of sliders for controlling the emotional state of
 * the selected character. Each slider is a sefirah of emotional expression.
 */
export class SoulController extends Component {
  constructor(state) {
    super(state);
  }

  render() {
    const chars = this.state.get('characters') || {};
    const targetId = this.state.get('selectedCharacterId') || 'c1';
    const char = chars[targetId] || {};

    const sliders = [
      { key: 'moodIntensity', label: 'INTENSITY', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'speakIntensity', label: 'SPEAK_VOL', min: 0, max: 1, step: 0.01, default: 0 },
      { key: 'vocalIntensity', label: 'VOCAL_PWR', min: 0, max: 1, step: 0.01, default: 0 }
    ];

    return {
      tag: 'div',
      attr: { className: 'soul-controller', style: { display: 'flex', flexDirection: 'column', gap: '1rem' } },
      children: sliders.map(sl => ({
        tag: 'div',
        attr: { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
        children: [
          { tag: 'div', attr: { style: { display: 'flex', justifyContent: 'space-between' } }, children: [
            { tag: 'span', attr: { style: { fontSize: '9px', letterSpacing: '1px', color: '#666' } }, children: sl.label },
            { tag: 'span', attr: { id: `val-${sl.key}`, style: { fontSize: '9px', color: '#fff', fontFamily: 'monospace' } }, children: String((char[sl.key] ?? sl.default).toFixed(2)) }
          ]},
          { tag: 'input', attr: { type: 'range', min: sl.min, max: sl.max, step: sl.step, value: char[sl.key] ?? sl.default, style: { width: '100%', accentColor: 'var(--accent-primary)' } },
            events: {
              input: (e) => {
                const val = parseFloat(e.target.value);
                const valDisplay = document.getElementById(`val-${sl.key}`);
                if (valDisplay) valDisplay.innerText = val.toFixed(2);
                const newChars = { ...this.state.get('characters') };
                if (newChars[targetId]) {
                  newChars[targetId][sl.key] = val;
                  this.state.set('characters', newChars);
                }
              }
            }
          }
        ]
      }))
    };
  }
}