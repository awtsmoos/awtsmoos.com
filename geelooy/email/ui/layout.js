// B"H
/**
 * @module MailSocialLayout
 * @description
 * Chapter 25: Messages become a connected chamber of the social network.
 *
 * The existing quantum mail engine remains intact. This layout only wraps it
 * with the immense Geelooy page language: a sanctuary shell, social title, and
 * navigation back to profile, Heichelos, notifications, and the home feed.
 */

import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';

export function renderAppLayout(ui, root) {
    renderLoginOverlay(ui, root);
    renderComposeModal(ui, root);
    ui.html({
        parent: root,
        tag: 'div',
        shaym: 'socialMailShell',
        classList: ['mail-social-shell'],
        children: [
            {
                tag: 'header',
                classList: ['mail-social-topbar'],
                children: [
                    { tag: 'a', attrs: { href: '/' }, textContent: 'Geelooy' },
                    { tag: 'strong', textContent: 'Messages / Mail' },
                    { tag: 'a', attrs: { href: '/notifications' }, textContent: 'Notifications' }
                ]
            },
            {
                tag: 'div',
                shaym: 'appContainer',
                classList: ['app-container', 'mail-social-frame'],
                children: [
                    { tag: 'aside', classList: ['sidebar', 'mail-social-sidebar'], shaym: 'sidebarPanel', ready: el => renderSidebar(ui, el) },
                    { tag: 'main', classList: ['chat-area', 'mail-social-chat'], shaym: 'chatPanel', ready: el => renderChat(ui, el) }
                ]
            },
            {
                tag: 'nav',
                classList: ['mail-bottom-nav'],
                children: [
                    { tag: 'a', attrs: { href: '/' }, textContent: 'Home' },
                    { tag: 'a', attrs: { href: '/heichelos' }, textContent: 'Heichelos' },
                    { tag: 'a', attrs: { href: '/heichelos/submit' }, textContent: '+' },
                    { tag: 'a', attrs: { href: '/email' }, textContent: 'Messages' },
                    { tag: 'a', attrs: { href: '/profile' }, textContent: 'Profile' }
                ]
            }
        ]
    });
}
