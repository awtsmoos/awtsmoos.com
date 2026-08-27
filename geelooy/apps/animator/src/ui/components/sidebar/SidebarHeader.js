// B"H
import { Component } from '../../../core/ui/Component.js';
import { ViewSelector } from './ViewSelector.js';

/**
 * @file SidebarHeader.js
 * @description
 * THE CROWN OF THE SIDEBAR (Keter HaSidebar).
 * B"H - The topmost UI vessel of the left panel, containing the logo,
 * view-angle selectors, and the collapse toggle button.
 */
export class SidebarHeader extends Component {
  constructor(state) {
    super(state);
    this.viewSelector = new ViewSelector(state);
  }

  render() {
    return {
      tag: 'div',
      attr: { className: 'sidebar-header' },
      children: [
        { tag: 'div', attr: { className: 'logo-area' }, children: [
          { tag: 'span', attr: { className: 'logo-text' }, children: 'GEVURAH // ACTOR' }
        ]},
        this.viewSelector.render(),
        { tag: 'button', attr: { id: 'toggle-sidebar', className: 'collapse-btn' }, children: '×' }
      ]
    };
  }
}