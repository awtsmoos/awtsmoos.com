import { forge, reveal } from './domForge.js';

/**
 * B"H
 * Builds clean selectable grids for character and map selection.
 *
 * The menu teaches the actual combat: F punch, G kick, H grab, Shift shield,
 * R special. The cards are large enough to use on desktop and phone.
 */
export function showCardGrid(host, config) {
  reveal(host, {
    tag: 'section', attrs: { class: 'menuPanel' }, children: [
      { tag: 'h2', children: [config.title] },
      { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.subtitle] },
      { tag: 'div', attrs: { class: 'instructionBox' }, children: [
        'Move: A/D or joystick · Jump: W/Space/↑ · Punch: F/P · Kick: G/K · Grab: H/G button · Shield: Shift/S · Special: R/✦'
      ] },
      { tag: 'div', attrs: { class: 'cardGrid' }, children: config.items.map(item => card(item, config.onPick)) }
    ]
  });
}

/** B"H — Big countdown with direct combat reminder. */
export function showCountdown(host, value) {
  reveal(host, {
    tag: 'section', attrs: { class: 'countdownPanel' }, children: [
      { tag: 'div', attrs: { class: 'countdownNumber' }, children: [String(value)] },
      { tag: 'p', children: ['Get ready: F punches, G kicks, Hebrew letters explode on hit.'] }
    ]
  });
}

function card(item, onPick) {
  return forge({
    tag: 'button', attrs: { class: 'menuCard', type: 'button' }, on: { click: () => onPick(item) }, children: [
      { tag: 'span', attrs: { class: 'cardAura', style: `--h:${item.hue || 45}` } },
      { tag: 'strong', children: [item.name] },
      { tag: 'small', children: [item.role || item.description || 'Generated arena vessel'] },
      { tag: 'em', children: ['Select'] }
    ]
  });
}
