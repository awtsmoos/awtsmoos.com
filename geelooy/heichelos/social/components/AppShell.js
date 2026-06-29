// B"H
import { h } from './render.js';
import { TopNav } from './TopNav.js';
import { NotificationDigest } from './NotificationDigest.js';
export function AppShell(mainChildren = [], options = {}) {
    return h('div', { class: 'awtsmoos-social-root' }, [h('div', { class: 'awt-shell' }, [TopNav(options), h('div', { class: 'awt-grid awt-layout' }, [leftRail(options), h('main', { class: 'awt-main' }, mainChildren), rightRail(options)])])]);
}
function leftRail(options = {}) { return h('aside', { class: 'awt-rail left' }, [h('a', { class: 'awt-chip', href: '#feed' }, ['Feed']), h('a', { class: 'awt-chip', href: '#composer' }, ['Create']), h('a', { class: 'awt-chip', href: '/heichelos' }, ['Heichelos']), h('button', { class: 'awt-chip awt-link-button', type: 'button', onclick: options.onRefresh }, ['Refresh'])]); }
function rightRail(options = {}) { return h('aside', { class: 'awt-rail right' }, [NotificationDigest(options.notifications || {})]); }
