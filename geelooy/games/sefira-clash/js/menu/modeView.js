import { reveal } from './domForge.js';
import { modeCard } from './menuCards.js';
import { modeOptions } from './menuOptions.js';

/**
 * B"H
 * The front gate becomes brutally simple.
 *
 * Adventure is first because the user asked for a real platformer climb, one
 * level after another. VS is still one click away, but it no longer steals the
 * entire identity of the game. Settings and Credits stop pretending to be equal
 * combat choices; they become small clear utilities under the main doors.
 *
 * @param {Element} host - Overlay container.
 * @param {{onPick: Function}} config - Menu callbacks.
 */
export function showModeMenu(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel modePanel' }, children: [
    { tag: 'div', attrs: { class: 'menuHero' }, children: [
      { tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['B"H · main menu'] },
      { tag: 'h2', children: ['Choose Your Gate'] },
      { tag: 'p', attrs: { class: 'menuPoem' }, children: ['Adventure is the main climb now: one platform stage after another. Quick VS is still instant combat.'] }
    ] },
    { tag: 'div', attrs: { class: 'modeGrid' }, children: modeOptions().map(option => modeCard(option, config.onPick)) },
    { tag: 'div', attrs: { class: 'quickNav' }, children: [
      { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-customize-action': 'back' }, children: ['Change Fighter'] },
      { tag: 'span', children: ['Tip: hold punch or kick, aim with the stick, release into the launch.'] }
    ] }
  ] });
}
