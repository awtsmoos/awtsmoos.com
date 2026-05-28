import { DivineActionMap } from '../actions/DivineActionMap.js';

/** B"H - Main menu: one Desert world entry only. */
export const MainMenuBlueprint = {
  tag: 'div',
  className: 'awtsmoos-overlay',
  id: 'awtsmoos-main-menu',
  children: [
    { tag: 'div', className: 'awtsmoos-particles', id: 'awtsmoos-particle-layer' },
    { tag: 'div', className: 'awtsmoos-title-container', children: [
      { tag: 'h1', className: 'awtsmoos-main-title', text: 'Mitzvah' },
      { tag: 'h2', className: 'awtsmoos-sub-title', text: 'Desert Ladder' }
    ] },
    { tag: 'div', className: 'awtsmoos-button-grid', children: [
      { tag: 'button', className: 'awtsmoos-btn', text: 'Desert World', events: { click: () => DivineActionMap.execute('GO_TO_LEVEL_SELECT') } }
    ] }
  ]
};
