import { DivineActionMap } from '../actions/DivineActionMap.js';

/**
 * B"H
 * Desert-only sublevel select for the newer src UI path.
 */
export const LevelSelectBlueprint = {
  tag: 'div',
  className: 'awtsmoos-overlay',
  id: 'awtsmoos-level-select-menu',
  children: [
    { tag: 'div', className: 'awtsmoos-title-container', children: [
      { tag: 'h1', className: 'awtsmoos-main-title', text: 'Desert Ladder' }
    ] },
    { tag: 'div', className: 'awtsmoos-button-grid', children: [
      { tag: 'button', className: 'awtsmoos-btn', text: '1. Dust Gate', events: { click: () => DivineActionMap.execute('LOAD_WORLD', 'ladder-1.js') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 2. Mirror Dunes', events: { click: () => alert('B"H\n2. Mirror Dunes is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 3. Argument Ruins', events: { click: () => alert('B"H\n3. Argument Ruins is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 4. Garden of Teeth', events: { click: () => alert('B"H\n4. Garden of Teeth is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 5. Court of Sand', events: { click: () => alert('B"H\n5. Court of Sand is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 6. Palace Mirage', events: { click: () => alert('B"H\n6. Palace Mirage is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 7. Womb of Stone', events: { click: () => alert('B"H\n7. Womb of Stone is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 8. Flash Dunes', events: { click: () => alert('B"H\n8. Flash Dunes is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 9. Crown Threshold', events: { click: () => alert('B"H\n9. Crown Threshold is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 10. Collapse Pit', events: { click: () => alert('B"H\n10. Collapse Pit is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 11. Market of Curses', events: { click: () => alert('B"H\n11. Market of Curses is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 12. Charity Chamber', events: { click: () => alert('B"H\n12. Charity Chamber is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 13. Broken Seraph', events: { click: () => alert('B"H\n13. Broken Seraph is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 14. Collapse Serpent', events: { click: () => alert('B"H\n14. Collapse Serpent is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn locked', text: 'LOCKED - 15. Silent Crown', events: { click: () => alert('B"H\n15. Silent Crown is locked. Finish the first chamber first.') } },
      { tag: 'button', className: 'awtsmoos-btn', text: 'Back', events: { click: () => DivineActionMap.execute('GO_TO_MAIN_MENU') } }
    ] }
  ]
};
