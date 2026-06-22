// B"H
/**
 * @module MailSocialLayout
 * @description
 * Chapter 464: The mail chamber now wears the new unified Social Hub tag. Mail,
 * notifications, live sockets, and social API panels are no longer scattered
 * doors; they are one networked vessel.
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
                    { tag: 'a', classList: ['mail-social-hub-tag'], attrs: { href: '/social', title: 'Open unified Social Hub' }, textContent: 'Social Hub' },
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
                    { tag: 'a', attrs: { href: '/social' }, textContent: 'Social' },
                    { tag: 'a', attrs: { href: '/email' }, textContent: 'Messages' },
                    { tag: 'a', attrs: { href: '/profile' }, textContent: 'Profile' }
                ]
            }
        ]
    });
}
