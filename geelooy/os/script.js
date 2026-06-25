//B"H
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
import AwtsmoosOS from "./awtsmoosOs.js";
import menuItems from "./startMenu.js";
import { VirtualOSTunnelAgent } from "./tunnel-agent.js";
import { initSocialInboxBridge } from "./socialInboxBridge.js";
import { initCivilizationDesktop } from "./civilization/desktop.js";
import { renderCivilizationStartFeed } from "./civilization/start-menu-feed.js";

/**
 * B"H
 * Chapter 567: The desktop breathed; now civilization icons stand on the blue
 * field and the start menu whispers the latest sparks.
 */
const os = new AwtsmoosOS();
window.os = os;
window.VirtualOSTunnelAgent = VirtualOSTunnelAgent;
window.AwtsmoosSocialInbox = initSocialInboxBridge({ os });

function createWindow(title, content) { os.addWindow({ title, content }); }

document.getElementById('desktop').addEventListener('contextmenu', () => {});

let selected = false;
document.getElementById('start-button').onclick = async () => {
  const menu = document.getElementById('start-menu');
  const menuItemsContainer = document.getElementById('menu-items');
  menuItemsContainer.innerHTML = "";
  if (selected) { selected = false; menu.style.display = 'none'; return; }
  Object.keys(menuItems).map(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.onclick = () => menuItems[item]?.({ os });
    menuItemsContainer.appendChild(li);
  });
  await renderCivilizationStartFeed(menu).catch(() => {});
  menu.classList.remove('hidden');
  menu.style.display = 'block';
  function clickOutside(event) {
    if (!menu.contains(event.target) && event.target !== document.getElementById('start-button')) {
      menu.style.display = 'none';
      window.removeEventListener("click", clickOutside);
    }
  }
  window.addEventListener('click', clickOutside);
};

document.getElementById('desktop').addEventListener('dblclick', event => {
  if (event.target.classList.contains('window')) alert(`Opening ${event.target.querySelector('.window-header').textContent}`);
});

(async () => {
  const utils = await import("/scripts/awtsmoos/api/utils.js");
  Object.keys(utils).forEach(key => { window[key] = utils[key]; });
  const mainContainer = document.querySelector('.main');
  const existingLogin = document.getElementById('loginHolder');
  const topHeader = document.createElement('div');
  topHeader.className = 'awtsmoos-top-header';
  const loginWrapper = document.createElement('div');
  loginWrapper.className = 'login-area-container';
  if (existingLogin) loginWrapper.appendChild(existingLogin);
  const fsBtn = document.createElement('button');
  fsBtn.className = 'fullscreen-toggle-btn';
  fsBtn.title = "Toggle Infinite Mode (Fullscreen)";
  fsBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
  fsBtn.onclick = () => { os.toggleFullScreen(); fsBtn.style.transform = "scale(0.9)"; setTimeout(() => fsBtn.style.transform = "", 150); };
  topHeader.appendChild(loginWrapper);
  topHeader.appendChild(fsBtn);
  mainContainer.insertBefore(topHeader, mainContainer.firstChild);
  addEventListener("awtsmoosAliasChange", async () => { await os.start(); initCivilizationDesktop({ os }); });
  createProfileDropdown(existingLogin);
  initCivilizationDesktop({ os });
  window.AwtsmoosSocialInbox.renderBadge(document.getElementById('task-area')).catch(() => {});
})();

export { createWindow, os };
