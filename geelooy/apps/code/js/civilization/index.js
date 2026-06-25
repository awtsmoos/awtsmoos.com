// B"H
/** Chapter 607: Code Forge launcher binds civilization and universal objects. */
import { CivilizationClient } from './client.js';
import { CivilizationEventRain } from './event-rain.js';
import { CivilizationCockpit } from './cockpit.js';
import { CivilizationHud } from './hud.js';
import { UniversalCivilizationSearch } from './universal-search.js';
import { CivilizationLivingCard } from './living-card.js';
import { CivilizationPulseModes } from './pulse-modes.js';
import { CivilizationObjectInspector } from './object-inspector.js';
function button(label, title, action) {
  const node = document.createElement('button');
  node.className = 'icon-button civilization-launcher';
  node.title = title;
  node.textContent = label;
  node.onclick = action;
  return node;
}
async function refresh() {
  const [state, events] = await Promise.all([CivilizationClient.state(), CivilizationClient.events(20)]);
  CivilizationHud.render(state.success || {});
  CivilizationCockpit.setEvents(events.success || []);
  CivilizationEventRain.sprinkle(events.success || [], event => CivilizationCockpit.openEvent(event));
}
export const CivilizationFrontend = {
  async init() {
    CivilizationHud.init();
    CivilizationEventRain.init();
    CivilizationPulseModes.init();
    const target = document.getElementById('custom-menu-container') || document.body;
    if (!document.getElementById('civilization-cockpit-launcher')) {
      const cockpit = button('CIV', 'Civilization Cockpit', () => CivilizationCockpit.open());
      cockpit.id = 'civilization-cockpit-launcher';
      const search = button('⌕', 'Universal Civilization Search', () => UniversalCivilizationSearch.open());
      search.id = 'civilization-search-launcher';
      const card = button('◈', 'Living Profile Card', () => CivilizationLivingCard.open());
      card.id = 'civilization-card-launcher';
      const inspect = button('OBJ', 'Universal Object Inspector', () => CivilizationObjectInspector.open());
      inspect.id = 'civilization-object-launcher';
      const mode = button('◌', 'Cycle Civilization Mode', () => { mode.title = `Civilization Mode: ${CivilizationPulseModes.next()}`; });
      mode.id = 'civilization-mode-launcher';
      target.append(cockpit, search, card, inspect, mode);
    }
    await refresh().catch(error => console.warn('[CIV_FRONTEND]', error));
    setInterval(() => refresh().catch(() => {}), 60000);
  }
};
