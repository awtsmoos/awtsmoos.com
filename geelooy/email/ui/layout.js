// B"H
/**
 * @module MailSocialLayout
 * @description A stronger mail palace: every edge has a way home, the bottom
 * star rail is real navigation, and the Awtsmoos wraps the shell in readable
 * landmarks for mobile and desktop travelers.
 */
import { renderSidebar } from './sidebar.js';
import { renderChat } from './chat.js';
import { renderLoginOverlay, renderComposeModal } from './modals.js';

const routes = [
    ['/', 'Home', 'Return to Geelooy home'],
    ['/heichelos', 'Heichelos', 'Open sacred spaces'],
    ['/#awtsmoos-object-inspector', 'Social', 'Open social sanctuary'],
    ['/email', 'Messages', 'Open mail chamber'],
    ['/profile', 'Profile', 'Open your profile']
];

function navItem([href, label, aria], current = false) {
    return {
        tag: 'a',
        classList: current ? ['active'] : [],
        attrs: { href, 'aria-label': aria, ...(current ? { 'aria-current': 'page' } : {}) },
        textContent: label
    };
}

function topLinks() {
    return [
        { tag: 'a', classList: ['mail-top-home'], attrs: { href: '/' }, textContent: '← Geelooy' },
        { tag: 'a', attrs: { href: '/heichelos' }, textContent: 'Heichelos' },
        { tag: 'a', classList: ['mail-social-hub-tag'], attrs: { href: '/#awtsmoos-object-inspector', title: 'Open unified Social Hub' }, textContent: 'Social Hub' },
        { tag: 'a', attrs: { href: '/notifications' }, textContent: 'Notifications' },
        { tag: 'a', attrs: { href: '/profile' }, textContent: 'Profile' }
    ];
}

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
                    { tag: 'nav', classList: ['mail-top-links'], attrs: { 'aria-label': 'Mail route shortcuts' }, children: topLinks() },
                    { tag: 'div', classList: ['mail-title-lockup'], children: [
                        { tag: 'span', classList: ['mail-kicker'], textContent: 'Awtsmoos Mail' },
                        { tag: 'strong', textContent: 'Messages / Living Transmissions' }
                    ] }
                ]
            },
            {
                tag: 'div', shaym: 'appContainer', classList: ['app-container', 'mail-social-frame'], children: [
                    { tag: 'aside', classList: ['sidebar', 'mail-social-sidebar'], shaym: 'sidebarPanel', ready: el => renderSidebar(ui, el) },
                    { tag: 'main', classList: ['chat-area', 'mail-social-chat'], shaym: 'chatPanel', ready: el => renderChat(ui, el) }
                ]
            },
            {
                tag: 'nav',
                classList: ['mail-bottom-nav'],
                attrs: { 'aria-label': 'Primary Geelooy routes' },
                children: routes.map(route => navItem(route, route[0] === '/email'))
            }
        ]
    });
}
