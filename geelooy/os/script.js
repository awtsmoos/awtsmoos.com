// B"H
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import AwtsmoosOS from './awtsmoosOs.js';
import menuItems from './startMenu.js';
import { VirtualOSTunnelAgent } from './tunnel-agent.js';
import { initSocialInboxBridge } from './socialInboxBridge.js';
import { renderCivilizationStartFeed } from './civilization/start-menu-feed.js';

const os = new AwtsmoosOS(); window.os = os; window.VirtualOSTunnelAgent = VirtualOSTunnelAgent; window.AwtsmoosSocialInbox = initSocialInboxBridge({ os });
function createWindow(title, content) { os.addWindow({ title, content }); }

document.getElementById('desktop').addEventListener('contextmenu', () => {}); let selected = false;
document.getElementById('start-button').onclick = async () => {
  const menu = document.getElementById('start-menu'), list = document.getElementById('menu-items'); list.innerHTML = '';
  if (selected) { selected = false; menu.style.display = 'none'; return; }
  Object.keys(menuItems).forEach(item => { const li = document.createElement('li'); li.textContent = item; li.onclick = () => menuItems[item]?.({ os }); list.appendChild(li); });
  await renderCivilizationStartFeed(menu).catch(() => {}); menu.classList.remove('hidden'); menu.style.display = 'block';
  const clickOutside = event => { if (!menu.contains(event.target) && event.target !== document.getElementById('start-button')) { menu.style.display = 'none'; window.removeEventListener('click', clickOutside); } };
  window.addEventListener('click', clickOutside);
};
document.getElementById('desktop').addEventListener('dblclick', event => { if (event.target.classList.contains('window')) os.taskbar.notify(`Opening ${event.target.querySelector('.window-header')?.textContent || 'window'}`, 'open'); });
addEventListener('awtsmoosAliasChange', async e => { os.recordGraphEvent?.('alias.change', e.detail || {}); await os.start(); os.updateStatus(); });
addEventListener('awtsmoosLogin', e => os.recordGraphEvent?.('login', e.detail || {}));
addEventListener('awtsmoosLogout', e => os.recordGraphEvent?.('logout', e.detail || {}));
(async () => {
  const utils = await import('/scripts/awtsmoos/api/utils.js'); Object.keys(utils).forEach(key => { window[key] = utils[key]; });
  const main = document.querySelector('.main'), login = document.getElementById('loginHolder'), header = document.createElement('div'); header.className = 'awtsmoos-top-header';
  const loginWrapper = document.createElement('div'); loginWrapper.className = 'login-area-container'; if (login) loginWrapper.appendChild(login);
  const fsBtn = document.createElement('button'); fsBtn.className = 'fullscreen-toggle-btn'; fsBtn.title = 'Toggle Infinite Mode (Fullscreen)';
  fsBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
  fsBtn.onclick = () => { os.toggleFullScreen(); fsBtn.style.transform = 'scale(.9)'; setTimeout(() => fsBtn.style.transform = '', 150); };
  header.append(loginWrapper, fsBtn); main.insertBefore(header, main.firstChild); createProfileDropdown(login);
  await os.start(); document.querySelectorAll('.civ-os-icon').forEach(node => node.remove()); window.AwtsmoosSocialInbox.renderBadge(document.getElementById('task-area')).catch(() => {});
})();
export { createWindow, os };
/** B"H: boot now has exactly one desktop icon renderer; civilization stays in menus/windows. */
