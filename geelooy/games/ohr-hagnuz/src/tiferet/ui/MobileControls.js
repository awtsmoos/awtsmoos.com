/**
 * B"H
 * @module MobileControls
 *
 * Chapter 72: The buttons became rooms instead of echoes.
 * The Awtsmoos has no body and no form; touch vessels must still answer with
 * usable worlds. This controller converts thumb-presses into movement, panels,
 * and clear mobile guidance without stealing the canvas from the walking soul.
 */
import { State } from '../../binah/State.js';
import { BATTLE_BUTTONS, DIRECTION_BUTTONS, OVERWORLD_BUTTONS } from './MobileControlSchema.js';

const HOLD_INTENTS = new Set(['U', 'D', 'L', 'R']);
const PULSE_FRAMES = 5;

const ensureIntents = () => {
  window.AwtsmoosIntents ||= { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 };
  return window.AwtsmoosIntents;
};

const buttonHtml = item => `
  <button class="ohr-touch ${item.className || ''}" data-intent="${item.intent || ''}" data-action="${item.action || ''}" aria-label="${item.text || item.label}">
    <span>${item.label}</span>${item.text ? `<small>${item.text}</small>` : ''}
  </button>`;

const questHtml = () => `
  <aside class="ohr-world-card" aria-live="polite">
    <b>✦ Guidance</b><span data-ohr-message>B"H - Walk, talk, and reveal hidden light.</span>
  </aside>`;

const row = (label, value) => `<p><b>${label}</b><span>${value}</span></p>`;
const countKeys = obj => Object.keys(obj || {}).length;
const titleCase = key => key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const PANEL_BUILDERS = {
  menu: () => ({
    title: 'Menu',
    intro: 'The traveler stands in a living world. Continue walking, seek sparks, and answer every place with purpose.',
    rows: [
      ['Light', `${State.Stats.light}/${State.Stats.maxLight}`],
      ['Level', State.Stats.level],
      ['Experience', `${State.Stats.exp}/${State.Stats.nextExp}`],
      ['Garment', titleCase(State.Equipment.garment)]
    ]
  }),
  map: () => ({
    title: 'Map',
    intro: `Current realm: ${titleCase(State.MapId)}. Tap a reachable square to walk with the new slower stride.`,
    rows: [
      ['Position', `${State.Hero.cx}, ${State.Hero.cy}`],
      ['Facing', State.Hero.dir.toUpperCase()],
      ['Visited maps', Object.keys(State.VisitedMaps).map(titleCase).join(', ') || 'None yet'],
      ['Path tiles', State.HeroPath.length]
    ]
  }),
  journal: () => ({
    title: 'Journal',
    intro: 'Seek the hidden light. Every NPC, door, debate, and garment is part of the shlichus path.',
    rows: [
      ['Active quests', countKeys(State.Quests.active)],
      ['Completed quests', countKeys(State.Quests.completed)],
      ['Debates won', State.Stats.debatesWon],
      ['Wild victories', State.Quests.counters.wildWon]
    ]
  }),
  items: () => ({
    title: 'Items',
    intro: 'Your vessels are counted here so the inventory button finally reveals something real.',
    rows: Object.entries(State.Inventory.items).map(([k, v]) => [titleCase(k), v])
  })
};

export class MobileControls {
  static root = null;
  static bound = false;
  static pulses = {};

  static mount() {
    this.root = document.getElementById('ohr-ui-root');
    if (!this.root || this.bound) return;
    this.root.innerHTML = this.html();
    this.bound = true;
    this.bind();
  }

  static html() {
    return `
      ${questHtml()}
      <section class="ohr-joy">${DIRECTION_BUTTONS.map(buttonHtml).join('')}<div class="ohr-joy-core"></div></section>
      <section class="ohr-right-rail">${OVERWORLD_BUTTONS.slice(1, 3).map(buttonHtml).join('')}</section>
      <section class="ohr-bottom-actions">${OVERWORLD_BUTTONS.slice(3).map(buttonHtml).join('')}</section>
      <section class="ohr-menu-action">${buttonHtml(OVERWORLD_BUTTONS[0])}</section>
      <section class="ohr-battle-actions">${BATTLE_BUTTONS.map(buttonHtml).join('')}</section>
      <section class="ohr-panel-shell" data-ohr-panel></section>`;
  }

  static bind() {
    this.root.querySelectorAll('[data-intent]').forEach(node => this.bindIntent(node));
    this.root.querySelectorAll('[data-action]').forEach(node => node.addEventListener('click', e => this.action(e, node.dataset.action)));
    this.root.querySelector('[data-ohr-panel]')?.addEventListener('click', e => this.panelClick(e));
    window.addEventListener('blur', () => this.releaseAll());
    window.addEventListener('pagehide', () => this.releaseAll());
  }

  static bindIntent(node) {
    const intent = node.dataset.intent;
    if (!intent) return;
    node.addEventListener('pointerdown', e => this.intentDown(e, node, intent));
    node.addEventListener('pointerup', e => this.intentUp(e, node, intent));
    node.addEventListener('pointerleave', e => this.intentUp(e, node, intent));
    node.addEventListener('pointercancel', e => this.intentUp(e, node, intent));
    node.addEventListener('click', e => this.intentClick(e, intent));
  }

  static intentDown(e, node, intent) {
    e.preventDefault();
    node.setPointerCapture?.(e.pointerId);
    ensureIntents()[intent] = 1;
    if (!HOLD_INTENTS.has(intent)) this.pulses[intent] = PULSE_FRAMES;
  }

  static intentUp(e, node, intent) {
    e.preventDefault();
    node.releasePointerCapture?.(e.pointerId);
    if (HOLD_INTENTS.has(intent)) ensureIntents()[intent] = 0;
    else this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES);
  }

  static intentClick(e, intent) {
    if (!intent || HOLD_INTENTS.has(intent)) return;
    e.preventDefault();
    this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES);
    ensureIntents()[intent] = 1;
  }

  static action(e, action) {
    if (!action) return;
    e.preventDefault();
    State.openPanel(action);
  }

  static panelClick(e) {
    if (e.target?.closest?.('[data-close-panel]')) State.openPanel(null);
  }

  static update() {
    if (!this.root) return;
    this.root.dataset.realm = State.ActiveRealm === 'DEBATE' ? 'battle' : 'world';
    this.tickPulses();
    const message = this.root.querySelector('[data-ohr-message]');
    if (message) message.textContent = State.Message || 'Walk, talk, and discover.';
    this.renderPanel();
  }

  static renderPanel() {
    const shell = this.root.querySelector('[data-ohr-panel]');
    if (!shell) return;
    const panel = State.UiPanel && PANEL_BUILDERS[State.UiPanel]?.();
    shell.innerHTML = panel ? this.panelHtml(panel) : '';
    shell.dataset.open = panel ? 'true' : 'false';
  }

  static panelHtml(panel) {
    const rows = panel.rows.map(([label, value]) => row(label, value)).join('');
    return `<article class="ohr-panel"><button data-close-panel aria-label="Close panel">×</button><h2>${panel.title}</h2><div>${panel.intro}</div><section>${rows}</section></article>`;
  }

  static tickPulses() {
    const intents = ensureIntents();
    Object.keys(this.pulses).forEach(intent => {
      if (this.pulses[intent] > 0) {
        intents[intent] = 1;
        this.pulses[intent] -= 1;
      } else {
        intents[intent] = 0;
        delete this.pulses[intent];
      }
    });
  }

  static releaseAll() {
    const intents = ensureIntents();
    ['U', 'D', 'L', 'R', 'A', 'B'].forEach(key => { intents[key] = 0; });
    this.pulses = {};
  }
}
