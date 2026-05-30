/**
 * B"H
 * @module MobileControls
 *
 * Chapter 18: The Thumb Entered The Garden And The Garden Answered.
 * The Awtsmoos has no body and no form; this controller only shapes mortal
 * gestures into pure game intent: walk, talk, interact, flee, and remember.
 */
import { State } from '../../binah/State.js';
import { BATTLE_BUTTONS, DIRECTION_BUTTONS, OVERWORLD_BUTTONS } from './MobileControlSchema.js';

const ensureIntents = () => {
  window.AwtsmoosIntents ||= {};
  return window.AwtsmoosIntents;
};

const buttonHtml = item => `
  <button class="ohr-touch ${item.className || ''}" data-intent="${item.intent || ''}" data-action="${item.action || ''}" aria-label="${item.text || item.label}">
    <span>${item.label}</span>${item.text ? `<small>${item.text}</small>` : ''}
  </button>`;

/**
 * MobileControls manifests the mockup controls as real interactive DOM.
 */
export class MobileControls {
  static root = null;
  static bound = false;

  static mount() {
    this.root = document.getElementById('ohr-ui-root');
    if (!this.root || this.bound) return;
    this.root.innerHTML = this.html();
    this.bound = true;
    this.bind();
  }

  static html() {
    return `
      <section class="ohr-joy">${DIRECTION_BUTTONS.map(buttonHtml).join('')}<div class="ohr-joy-core"></div></section>
      <section class="ohr-right-rail">${OVERWORLD_BUTTONS.slice(1, 3).map(buttonHtml).join('')}</section>
      <section class="ohr-bottom-actions">${OVERWORLD_BUTTONS.slice(3).map(buttonHtml).join('')}</section>
      <section class="ohr-menu-action">${buttonHtml(OVERWORLD_BUTTONS[0])}</section>
      <section class="ohr-battle-actions">${BATTLE_BUTTONS.map(buttonHtml).join('')}</section>`;
  }

  static bind() {
    this.root.querySelectorAll('[data-intent]').forEach(node => {
      const intent = node.dataset.intent;
      if (!intent) return;
      node.addEventListener('pointerdown', e => this.intent(e, intent, 1));
      node.addEventListener('pointerup', e => this.intent(e, intent, 0));
      node.addEventListener('pointerleave', e => this.intent(e, intent, 0));
      node.addEventListener('pointercancel', e => this.intent(e, intent, 0));
    });
    this.root.querySelectorAll('[data-action]').forEach(node => node.addEventListener('click', e => this.action(e, node.dataset.action)));
  }

  static intent(e, intent, value) {
    e.preventDefault();
    ensureIntents()[intent] = value;
  }

  static action(e, action) {
    if (!action) return;
    e.preventDefault();
    const lines = { menu: 'Menu vessel coming soon.', map: `Map: ${State.MapId}`, journal: 'Journal: seek the hidden light.', items: 'Items will open after inventory expands.' };
    State.say(lines[action] || 'The button shines quietly.', 120);
  }

  static update() {
    if (!this.root) return;
    this.root.dataset.realm = State.ActiveRealm === 'DEBATE' ? 'battle' : 'world';
  }
}
