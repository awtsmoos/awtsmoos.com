import { reveal } from './domForge.js';
import { arenaCard, levelCard } from './menuCards.js';

/**
 * B"H
 * Grid views for arenas and campaign gates.
 *
 * Here the Awtsmoos separates two different realities: VS is a pile of arenas,
 * Adventure is a ladder. The player should never wonder which world they are
 * entering. One header says fight now; the other says climb in order.
 */

/** @param {Element} host @param {object} config */
export function showCardGrid(host, config) {
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel' }, children: [
    backButton(),
    { tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['instant battle'] },
    { tag: 'h2', children: [config.title] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [config.subtitle] },
    { tag: 'div', attrs: { class: 'instructionBox' }, children: ['Move with the stick. Aim while releasing Punch/Kick. Down slams. Hold to charge.'] },
    { tag: 'div', attrs: { class: 'cardGrid' }, children: config.items.map(item => arenaCard(item, config.onPick)) }
  ] });
}

/** @param {Element} host @param {object} config */
export function showAdventureGrid(host, config) {
  const cleared = config.items.filter(item => item.adventureUi?.cleared).length;
  reveal(host, { tag: 'section', attrs: { class: 'menuPanel adventurePanel' }, children: [
    backButton(),
    { tag: 'p', attrs: { class: 'menuEyebrow' }, children: ['platform campaign'] },
    { tag: 'h2', children: ['Adventure Gates'] },
    { tag: 'p', attrs: { class: 'menuPoem' }, children: [`${cleared}/50 gates cleared. Run, jump, stomp, collect Sparks, defeat Kelipos, unlock the next gate.`] },
    { tag: 'div', attrs: { class: 'adventureRoad' }, children: ['Gate 1 → Gate 2 → Gate 3 → ... → Gate 50'] },
    { tag: 'div', attrs: { class: 'levelGrid' }, children: config.items.map(item => levelCard(item, config.onPick)) }
  ] });
}

function backButton() {
  return { tag: 'button', attrs: { class: 'backMenuButton', type: 'button', 'data-menu-back': 'mode' }, children: ['← Gates'] };
}
