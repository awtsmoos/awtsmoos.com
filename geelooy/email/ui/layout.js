// B"H
/**
 * @module MailSocialLayout
 * @description Chapter 709: mail becomes a chamber of Geelooy, not an exile.
 * The shell supplies dock/search/drawer; mail keeps its sender groups and chat.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';
import { bottomNavItems, topLinks } from './navItems.js';
export function renderAppLayout(ui, root) {
  renderLoginOverlay(ui, root);
  renderComposeModal(ui, root);
  ui.html({ parent: root, tag: 'div', shaym: 'socialMailShell', classList: ['mail-social-shell', 'geelooy-content-region'], children: [
    { tag: 'header', classList: ['mail-social-topbar', 'geelooy-toolbar'], children: [
      { tag: 'div', classList: ['mail-title-lockup'], children: [
        { tag: 'span', classList: ['mail-kicker', 'g-kicker'], textContent: 'Mail chamber' },
        { tag: 'strong', textContent: '✉️ Sender Groups' },
        { tag: 'small', textContent: 'profile-aware inbox inside Geelooy' }
      ]},
      { tag: 'nav', classList: ['mail-top-links'], attributes: { 'aria-label': 'Mail route shortcuts' }, children: topLinks() }
    ]},
    { tag: 'div', shaym: 'appContainer', classList: ['app-container', 'mail-social-frame'], children: [
      { tag: 'aside', classList: ['sidebar', 'mail-social-sidebar'], shaym: 'sidebarPanel', ready: el => renderSidebar(ui, el) },
      { tag: 'main', classList: ['chat-area', 'mail-social-chat'], shaym: 'chatPanel', ready: el => renderChat(ui, el) }
    ]},
    { tag: 'nav', classList: ['mail-bottom-nav'], attributes: { 'aria-label': 'Primary Geelooy routes' }, children: bottomNavItems() }
  ]});
}
