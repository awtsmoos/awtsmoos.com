// B"H
/** Chapter 561: One initializer binds HUD, sparks, cockpit, and graph button. */
import { CivilizationClient } from './client.js';
import { CivilizationEventRain } from './event-rain.js';
import { CivilizationCockpit } from './cockpit.js';
import { CivilizationHud } from './hud.js';

function button() {
  const node = document.createElement('button');
  node.className = 'icon-button civilization-launcher';
  node.title = 'Civilization Cockpit';
  node.textContent = 'CIV';
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
    const target = document.getElementById('custom-menu-container') || document.body;
    const open = button();
    open.onclick = () => CivilizationCockpit.open();
    target.appendChild(open);
    await refresh().catch(error => console.warn('[CIV_FRONTEND]', error));
    setInterval(() => refresh().catch(() => {}), 60000);
  }
};
