/**
 * B"H
 * @module MobileControls
 * @description Touch UI, dialogue trees, relationship map, mission tracker, and Bag.
 *
 * Chapter 203: The Bag swallowed the Journal and did not destroy it. The
 * Awtsmoos has no body and no form, yet the player should feel possessions as
 * one vessel: money, clothing, consumables, mission ledger, and battle notes all
 * sit together inside the traveling bag.
 */
import { State } from '../../binah/State.js';
import { BATTLE_BUTTONS, DIRECTION_BUTTONS, OVERWORLD_BUTTONS } from './MobileControlSchema.js';
import { routeSummary } from '../../yesod/abilities/AbilityRuntime.js';
import { questSummary } from '../../yesod/OhrQuest.js';
import { codexRows, codexSummary } from '../../yesod/codex/TorahCodexRuntime.js';
import { dexRows, dexLine } from '../../yesod/musag/MusagDex.js';
import { zoneThemeForMap } from '../../data/concepts/TorahCodexIndex.js';
import { QuestIndex } from '../../data/QuestIndex.js';
import { bagRows, clothesRows, ensureBag, journalRows } from '../../yesod/bag/BagRuntime.js';

const HOLD_INTENTS = new Set(['U', 'D', 'L', 'R']);
const PULSE_FRAMES = 5;
const titleCase = key => String(key).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const row = (label, value) => `<p><b>${esc(label)}</b><span>${esc(value)}</span></p>`;
const buttonHtml = item => `<button class="ohr-touch ${item.className || ''}" data-intent="${item.intent || ''}" data-action="${item.action || ''}" aria-label="${item.text || item.label}"><span>${item.label}</span>${item.text ? `<small>${item.text}</small>` : ''}</button>`;
const ensureIntents = () => (window.AwtsmoosIntents ||= { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 });
const questHtml = () => `<aside class="ohr-world-card" aria-live="polite"><b>✦ Current Mission</b><span data-ohr-message>Talk to ג. Follow one step at a time.</span></aside>`;
const activeMission = () => questSummary().active[0] || null;
const routeRows = () => routeSummary().map((line, i) => [`Route ${i + 1}`, line]);

const relationshipRows = () => {
  const qs = questSummary();
  const active = qs.active[0];
  const giver = active ? QuestIndex[active.id]?.giver : 'ג';
  const chain = qs.completed.slice(-4).map(id => QuestIndex[id]?.giver || id).join(' → ') || 'Start at ג';
  return [['Current guide', giver], ['Current mission', active?.title || qs.next], ['Recent chain', chain], ['Meaning', 'NPCs are soul-functions; follow giver → task → return.'], ['How to talk', 'Tap NPC to face, then press Talk.']];
};

const panels = {
  menu: () => {
    ensureBag();
    const codex = codexSummary();
    const zone = zoneThemeForMap(State.MapId);
    return { title: `Act ${State.Story.chapter}: ${State.Story.active}`, intro: `${zone.name}: ${zone.mood}`, rows: [
      ['Next', questSummary().next], ['Zuzim', State.Inventory.money || 0], ['Soul Path', `${codex.soul.name} (${codex.soul.category})`], ['Light', `${State.Stats.light}/${State.Stats.maxLight}`],
      ['Level', State.Stats.level], ['Garment', titleCase(State.Equipment.garment)], ['Musag Dex', dexLine()], ...routeRows().slice(0, 2)] };
  },
  map: () => {
    const zone = zoneThemeForMap(State.MapId);
    return { title: 'Relationship Map', intro: `${zone.name}: ${zone.mood}. This is who to follow, not just coordinates.`, rows: relationshipRows() };
  },
  journal: () => ({ title: 'Journal inside Bag', intro: questSummary().next, rows: [...journalRows(), ...codexRows(), ...dexRows()] }),
  items: () => ({ title: 'Bag', intro: 'Money, consumables, clothes, and the Journal are all carried here.', rows: [...bagRows(), ['— Clothes —', ''], ...clothesRows(), ['— Journal —', ''], ...journalRows()] })
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
    return `${questHtml()}<section class="ohr-joy">${DIRECTION_BUTTONS.map(buttonHtml).join('')}<div class="ohr-joy-core"></div></section><section class="ohr-right-rail">${OVERWORLD_BUTTONS.slice(1, 3).map(buttonHtml).join('')}</section><section class="ohr-bottom-actions">${OVERWORLD_BUTTONS.slice(3).map(buttonHtml).join('')}</section><section class="ohr-menu-action">${buttonHtml(OVERWORLD_BUTTONS[0])}</section><section class="ohr-battle-actions">${BATTLE_BUTTONS.map(buttonHtml).join('')}</section><section class="ohr-panel-shell" data-ohr-panel></section><section class="ohr-dialogue-shell" data-ohr-dialogue></section>`;
  }

  static bind() {
    this.root.querySelectorAll('[data-intent]').forEach(node => this.bindIntent(node));
    this.root.querySelectorAll('[data-action]').forEach(node => node.addEventListener('click', e => this.action(e, node.dataset.action)));
    this.root.querySelector('[data-ohr-panel]')?.addEventListener('click', e => this.panelClick(e));
    this.root.querySelector('[data-ohr-dialogue]')?.addEventListener('click', e => this.dialogueClick(e));
    window.addEventListener('blur', () => this.releaseAll());
    window.addEventListener('pagehide', () => this.releaseAll());
  }

  static bindIntent(node) {
    const intent = node.dataset.intent;
    if (!intent) return;
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => node.addEventListener(type, e => this.intentUp(e, node, intent)));
    node.addEventListener('pointerdown', e => this.intentDown(e, node, intent));
    node.addEventListener('click', e => this.intentClick(e, intent));
  }

  static intentDown(e, node, intent) {
    e.preventDefault(); node.setPointerCapture?.(e.pointerId);
    if (State.isUiBlocking()) return this.releaseAll();
    ensureIntents()[intent] = 1;
    if (!HOLD_INTENTS.has(intent)) this.pulses[intent] = PULSE_FRAMES;
  }
  static intentUp(e, node, intent) { e.preventDefault(); node.releasePointerCapture?.(e.pointerId); if (HOLD_INTENTS.has(intent)) ensureIntents()[intent] = 0; else this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES); }
  static intentClick(e, intent) { if (!intent || HOLD_INTENTS.has(intent) || State.isUiBlocking()) return; e.preventDefault(); this.pulses[intent] = Math.max(this.pulses[intent] || 0, PULSE_FRAMES); ensureIntents()[intent] = 1; }
  static action(e, action) { if (action) { e.preventDefault(); State.openPanel(action); this.releaseAll(); } }
  static panelClick(e) { if (e.target?.closest?.('[data-close-panel]')) State.openPanel(null); }
  static dialogueClick(e) {
    if (e.target?.closest?.('[data-dialogue-close]')) State.closeDialogue(true);
    if (e.target?.closest?.('[data-dialogue-next]')) State.dialogueNext(1);
    if (e.target?.closest?.('[data-dialogue-back]')) State.dialogueNext(-1);
    if (e.target?.closest?.('[data-dialogue-mission]')) { State.closeDialogue(false); State.openPanel('journal'); }
  }

  static update() {
    if (!this.root) return;
    this.root.dataset.realm = State.ActiveRealm === 'DEBATE' ? 'battle' : 'world';
    this.root.dataset.blocking = State.isUiBlocking() ? 'true' : 'false';
    this.tickPulses();
    const message = this.root.querySelector('[data-ohr-message]');
    if (message) message.textContent = questSummary().next;
    this.renderPanel();
    this.renderDialogue();
  }

  static renderPanel() {
    const shell = this.root.querySelector('[data-ohr-panel]');
    if (!shell) return;
    const panel = State.UiPanel && panels[State.UiPanel]?.();
    shell.innerHTML = panel ? `<article class="ohr-panel"><button data-close-panel aria-label="Close panel">×</button><h2>${esc(panel.title)}</h2><div>${esc(panel.intro)}</div><section>${panel.rows.map(([a, b]) => row(a, b)).join('')}</section></article>` : '';
    shell.dataset.open = panel ? 'true' : 'false';
  }

  static renderDialogue() {
    const shell = this.root.querySelector('[data-ohr-dialogue]');
    if (!shell) return;
    const d = State.Dialogue;
    if (!d.open) { shell.innerHTML = ''; shell.dataset.open = 'false'; return; }
    const line = d.lines[d.index] || '';
    const count = `${d.index + 1}/${Math.max(1, d.lines.length)}`;
    const mission = activeMission();
    shell.innerHTML = `<article class="ohr-dialogue"><button data-dialogue-close aria-label="Close dialogue">×</button><h2>${esc(d.label)}</h2><div class="ohr-dialogue-count">${esc(count)} • ${esc(mission?.title || 'Story')}</div><p>${esc(line)}</p><footer><button data-dialogue-back>Back</button><button data-dialogue-mission>Mission</button><button data-dialogue-next>Next</button></footer></article>`;
    shell.dataset.open = 'true';
  }

  static tickPulses() {
    const intents = ensureIntents();
    if (State.isUiBlocking()) return this.releaseAll();
    Object.keys(this.pulses).forEach(intent => { if (this.pulses[intent] > 0) { intents[intent] = 1; this.pulses[intent] -= 1; } else { intents[intent] = 0; delete this.pulses[intent]; } });
  }
  static releaseAll() { const intents = ensureIntents(); ['U', 'D', 'L', 'R', 'A', 'B'].forEach(key => { intents[key] = 0; }); this.pulses = {}; }
}
