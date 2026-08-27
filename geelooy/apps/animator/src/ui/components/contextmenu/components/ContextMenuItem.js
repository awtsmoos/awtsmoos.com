// B"H
import { ContextMenuActions } from '../ContextMenuActions.js';

export class ContextMenuItem {
  static build(label, icon, actionKey, state, app) {
    return {
      tag: 'button',
      attr: { className: 'awtsmoos-menu-btn' },
      events: { click: () => ContextMenuActions.execute(actionKey, state, app) },
      children: [
        { tag: 'span', attr: { className: 'menu-icon' }, children: icon },
        { tag: 'span', attr: { className: 'menu-label' }, children: label }
      ]
    };
  }
}