import { forge } from './domForge.js';

/**
 * B"H
 * Card factories: the Awtsmoos condenses many menus into honest buttons.
 *
 * Each factory returns a real node so the parent views remain small and readable.
 * The card is not decoration alone; it is a covenant of navigation. A hand sees
 * it, knows what it does, presses it, and the next world opens without confusion.
 */

/** @param {object} option @param {Function} onPick @returns {HTMLButtonElement} */
export function modeCard(option, onPick) {
  return forge({ tag: 'button', attrs: modeAttrs(option), on: { click: () => onPick(option.kind) }, children: [
    aura(option.hue),
    { tag: 'span', attrs: { class: 'modeBadge' }, children: [option.featured ? 'Main path' : 'Option'] },
    { tag: 'strong', children: [option.title] },
    { tag: 'small', children: [option.text] },
    { tag: 'em', attrs: { class: 'menuButtonCue' }, children: [option.action] }
  ] });
}

/** @param {object} item @param {Function} onPick @returns {HTMLButtonElement} */
export function arenaCard(item, onPick) {
  return forge({ tag: 'button', attrs: { class: 'menuCard', type: 'button' }, on: { click: () => onPick(item) }, children: [
    aura(item.hue || 45),
    { tag: 'strong', children: [item.name] },
    { tag: 'small', children: [item.role || item.description || 'Arena vessel'] },
    { tag: 'em', attrs: { class: 'menuButtonCue' }, children: ['Select'] }
  ] });
}

/** @param {object} item @param {Function} onPick @returns {HTMLButtonElement} */
export function levelCard(item, onPick) {
  const ui = item.adventureUi || {};
  return forge({ tag: 'button', attrs: levelAttrs(item, ui), on: { click: () => !ui.locked && onPick(item) }, children: [
    aura(item.hue || 45),
    { tag: 'strong', children: [`Gate ${(ui.index || 0) + 1}: ${item.name}`] },
    { tag: 'small', children: [ui.locked ? 'Locked: clear the gate before it.' : item.description] },
    { tag: 'div', attrs: { class: 'levelMeta' }, children: levelMeta(item, ui) }
  ] });
}

/** @param {string} label @param {string} value @returns {object} */
export function stat(label, value) {
  return { tag: 'span', children: [{ tag: 'strong', children: [label] }, { tag: 'em', children: [value] }] };
}

/** @param {string} label @param {string} kind @param {boolean} disabled @returns {object} */
export function action(label, kind, disabled) {
  return { tag: 'button', attrs: { class: `victoryButton ${kind}`, type: 'button', 'data-victory-action': kind, disabled: disabled ? true : null }, children: [label] };
}

function aura(hue) { return { tag: 'span', attrs: { class: 'cardAura', style: `--h:${hue}` } }; }
function modeAttrs(option) { return { class: `modeCard ${option.featured ? 'featured' : ''}`, type: 'button', 'aria-label': option.title }; }
function levelAttrs(item, ui) { return { class: `levelCard ${ui.locked ? 'locked' : ''} ${ui.cleared ? 'cleared' : ''}`, type: 'button', disabled: ui.locked ? true : null, 'aria-label': item.name }; }
function levelMeta(item, ui) { return [item.difficulty || 'Easy', `${item.adventure?.bots || 1} kelipos`, `${ui.stars || 0}★`, `Best ${ui.best || '—'}`, `✦ ${ui.hiddenFound || 0}/${ui.hiddenTotal || 0}`].map(text => ({ tag: 'span', children: [text] })); }
