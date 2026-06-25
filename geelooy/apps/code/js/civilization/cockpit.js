// B"H
/** Chapter 559: A cockpit dialog for the living event river. */
import { UI } from '../ui.js';
function esc(value) { return String(value ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
function card(event) {
  const title = `${event.type || 'event'} · ${event.target?.type || 'target'}:${event.target?.id || ''}`;
  return `<details class="civilization-event-card"><summary>${esc(title)}</summary><pre>${esc(JSON.stringify(event, null, 2))}</pre></details>`;
}
export const CivilizationCockpit = {
  events: [],
  setEvents(events = []) { this.events = events; },
  async open(events = this.events) {
    const html = `<section class="civilization-cockpit"><header><h3>B"H Civilization Cockpit</h3><span class="civ-chip civ-pulse">${events.length} sparks</span></header>${events.map(card).join('') || '<p>No civilization events yet.</p>'}</section>`;
    return UI.showDialog({ title: 'Civilization Cockpit', contentHTML: html, okText: 'Close', cancelText: '' });
  },
  async openEvent(event) { return this.open([event]); }
};
