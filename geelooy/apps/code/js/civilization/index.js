// B"H
/**
 * @file index.js
 * @description
 * Civilization is still present, but now it enters the topbar as one gate, not
 * five scattered sparks. One button opens the menu; the hidden rooms remain.
 */
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
  node.type = 'button';
  node.title = title;
  node.textContent = label;
  node.onclick = action;
  return node;
}

function closeMenu(wrapper) {
  wrapper?.classList.remove('is-open');
}

function toggleMenu(wrapper) {
  wrapper?.classList.toggle('is-open');
}

function menuButton(id, label, title, action) {
  const node = button(label, title, event => { event.stopPropagation(); action(); closeMenu(node.closest('.civilization-launcher-pack')); });
  node.id = id;
  node.className = 'civilization-menu-item';
  return node;
}

function buildLauncher() {
  const wrapper = document.createElement('div');
  wrapper.id = 'civilization-launcher-pack';
  wrapper.className = 'civilization-launcher-pack';

  const trigger = button('CIV', 'Civilization tools', event => { event.stopPropagation(); toggleMenu(wrapper); });
  trigger.id = 'civilization-cockpit-launcher';
  trigger.className = 'icon-button civilization-launcher';

  const menu = document.createElement('div');
  menu.className = 'civilization-launcher-menu';
  menu.append(
    menuButton('civilization-open-cockpit', 'Cockpit', 'Civilization Cockpit', () => CivilizationCockpit.open()),
    menuButton('civilization-search-launcher', 'Search', 'Universal Civilization Search', () => UniversalCivilizationSearch.open()),
    menuButton('civilization-card-launcher', 'Living Card', 'Living Profile Card', () => CivilizationLivingCard.open()),
    menuButton('civilization-object-launcher', 'Object Inspector', 'Universal Object Inspector', () => CivilizationObjectInspector.open())
  );

  const mode = menuButton('civilization-mode-launcher', 'Cycle Mode', 'Cycle Civilization Mode', () => {
    trigger.title = `Civilization Mode: ${CivilizationPulseModes.next()}`;
  });
  menu.append(mode);
  wrapper.append(trigger, menu);
  return wrapper;
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
    if (!document.getElementById('civilization-launcher-pack')) target.append(buildLauncher());
    document.addEventListener('click', event => {
      const wrapper = document.getElementById('civilization-launcher-pack');
      if (wrapper && !wrapper.contains(event.target)) closeMenu(wrapper);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu(document.getElementById('civilization-launcher-pack'));
    });
    await refresh().catch(error => console.warn('[CIV_FRONTEND]', error));
    setInterval(() => refresh().catch(() => {}), 60000);
  }
};
