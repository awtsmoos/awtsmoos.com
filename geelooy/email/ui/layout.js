// B"H
/**
 * @module MailSocialLayout
 * @description Orchestrates the mail shell while nav data lives in navItems.js.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';
import { bottomNavItems, topLinks } from './navItems.js';

export function renderAppLayout(ui, root) {
  renderLoginOverlay(ui, root);
  renderComposeModal(ui, root);
  ui.html({ parent: root, tag: 'div', shaym: 'socialMailShell', classList: ['mail-social-shell'], children: [
    { tag: 'header', classList: ['mail-social-topbar'], children: [
      { tag: 'nav', classList: ['mail-top-links'], attributes: { 'aria-label': 'Mail route shortcuts' }, children: topLinks() },
      { tag: 'div', classList: ['mail-title-lockup'], children: [
        { tag: 'span', classList: ['mail-kicker'], textContent: 'Awtsmoos Mail' },
        { tag: 'strong', textContent: 'Messages / Living Transmissions' }
      ]}
    ]},
    { tag: 'div', shaym: 'appContainer', classList: ['app-container', 'mail-social-frame'], children: [
      { tag: 'aside', classList: ['sidebar', 'mail-social-sidebar'], shaym: 'sidebarPanel', ready: el => renderSidebar(ui, el) },
      { tag: 'main', classList: ['chat-area', 'mail-social-chat'], shaym: 'chatPanel', ready: el => renderChat(ui, el) }
    ]},
    { tag: 'nav', classList: ['mail-bottom-nav'], attributes: { 'aria-label': 'Primary Geelooy routes' }, children: bottomNavItems() }
  ]});
}
