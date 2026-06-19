// B"H
import { h } from './render.js';
import { TopNav } from './TopNav.js';
export function AppShell(mainChildren = []) {
    return h('div', { class: 'awtsmoos-social-root' }, [h('div', { class: 'awt-shell' }, [TopNav(), h('div', { class: 'awt-grid' }, [leftRail(), h('main', { class: 'awt-main' }, mainChildren), rightRail()])])]);
}
function leftRail() { return h('aside', { class: 'awt-rail left' }, [h('a', { class: 'awt-chip', href: '#feed' }, ['Feed']), h('a', { class: 'awt-chip', href: '#composer' }, ['Create']), h('a', { class: 'awt-chip', href: '#profile' }, ['Profile'])]); }
function rightRail() { return h('aside', { class: 'awt-rail right' }, [h('div', { class: 'awt-card' }, ['Notifications and heichel activity will live here.'])]); }
