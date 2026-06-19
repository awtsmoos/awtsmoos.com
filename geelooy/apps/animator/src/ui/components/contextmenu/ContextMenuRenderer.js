// B"H
import { RootMenuMap } from './data/RootMenuMap.js';
import { ClipMenuMap } from './data/ClipMenuMap.js';
import { ContextMenuItem } from './components/ContextMenuItem.js';
import { ContextMenuDivider } from './components/ContextMenuDivider.js';

export class ContextMenuRenderer {
  static render(type, state, app) {
    let mapData = [];
    if (type === 'clip') mapData = ClipMenuMap.getOptions();
    else if (type === 'root') mapData = RootMenuMap.getOptions();

    const children = mapData.map(item => {
      if (item === 'divider') return ContextMenuDivider.build();
      return ContextMenuItem.build(item.label, item.icon, item.actionKey, state, app);
    });

    return {
      tag: 'div',
      attr: { className: 'awtsmoos-menu-list' },
      children
    };
  }
}