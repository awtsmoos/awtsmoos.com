// B"H
import { Component } from '../../../core/ui/Component.js';

/**
 * @file ViewSelector.js
 * @description
 * THE ROTATOR OF PERSPECTIVES (Mehaneh HaPartzufim).
 * B"H - Allows the user to switch the character's facing direction and
 * view angle between the Kabbalistic partzuf perspectives: front, side, 3/4, etc.
 */
export class ViewSelector extends Component {
  render() {
    const chars = this.state.get('characters') || {};
    const targetId = this.state.get('selectedCharacterId') || 'c1';
    const char = chars[targetId] || {};
    const currentView = char.view || 'front';

    const views = [
      { id: 'front', label: 'TIFERET (FRONT)' },
      { id: 'side', label: 'NETZACH (SIDE)' },
      { id: 'threequarter', label: 'CHASSADIM (3/4)' },
      { id: 'up', label: 'KETER (UP)' },
      { id: 'down', label: 'MALCHUT (DOWN)' }
    ];

    return {
      tag: 'div',
      attr: { className: 'view-selector', style: { display: 'flex', flexWrap: 'wrap', gap: '4px' } },
      children: views.map(v => ({
        tag: 'button',
        attr: {
          className: `view-btn ${currentView === v.id ? 'active' : ''}`,
          style: { flex: '1 1 calc(33% - 4px)', padding: '6px', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px', border: '1px solid #222', background: currentView === v.id ? '#fff' : '#050505', color: currentView === v.id ? '#000' : '#888', cursor: 'pointer' }
        },
        events: {
          click: () => {
            const cChars = this.state.get('characters') || {};
            if (cChars[targetId]) {
              cChars[targetId].view = v.id;
              this.state.set('characters', { ...cChars });
            }
          }
        },
        children: v.label
      }))
    };
  }
}