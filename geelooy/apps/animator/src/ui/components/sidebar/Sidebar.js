
/* B”H */
import { Component } from '../../../core/ui/Component.js';

export class Sidebar extends Component {
  render() {
    return {
      tag: 'aside',
      attr: { id: 'left-sidebar', className: 'retractable-panel flex-col' },
      children: [
        {
          tag: 'div',
          attr: { className: 'panel-header' },
          children: [
            { tag: 'h2', children: 'PARK_CREATOR' },
            { 
              tag: 'button', 
              attr: { id: 'sidebar-toggle', className: 'toggle-btn' },
              children: '«',
              events: { click: () => this.toggle() }
            }
          ]
        },
        { tag: 'div', attr: { id: 'sidebar-content', className: 'scrollable flex-1' } },
        // Mount point for the new History Widget
        { tag: 'div', attr: { id: 'history-panel-mount', className: 'p-2' } } 
      ]
    };
  }

  toggle() {
    this.element.classList.toggle('collapsed');
    const btn = this.element.querySelector('#sidebar-toggle');
    btn.innerText = this.element.classList.contains('collapsed') ? '»' : '«';
  }
}
