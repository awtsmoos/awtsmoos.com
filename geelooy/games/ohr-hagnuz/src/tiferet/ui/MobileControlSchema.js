/**
 * B"H
 * @module MobileControlSchema
 *
 * Chapter 17: The Glass Became A Harp Of Commands.
 * The Awtsmoos has no body and no form; yet a phone needs touchable vessels.
 * This pure data tells the overlay which buttons exist before any DOM is born.
 */
export const DIRECTION_BUTTONS = [
  { label: '▲', intent: 'U', className: 'up' },
  { label: '◀', intent: 'L', className: 'left' },
  { label: '▶', intent: 'R', className: 'right' },
  { label: '▼', intent: 'D', className: 'down' }
];

export const OVERWORLD_BUTTONS = [
  { label: '☰', text: 'Menu', action: 'menu' },
  { label: '◇', text: 'Map', action: 'map' },
  { label: '!', text: 'Journal', action: 'journal' },
  { label: '☷', text: 'Talk', intent: 'A' },
  { label: '✡', text: 'Interact', intent: 'A' }
];

export const BATTLE_BUTTONS = [
  { label: '↯', text: 'Flee', intent: 'B' },
  { label: '☷', text: 'Items', action: 'items' }
];
