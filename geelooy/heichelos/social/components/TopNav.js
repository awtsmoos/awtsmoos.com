// B"H
import { h } from './render.js';
export function TopNav() {
    return h('header', { class: 'awt-topbar' }, [h('strong', {}, ['Awtsmoos Social']), h('nav', { class: 'awt-card-actions' }, [h('a', { href: '/heichelos' }, ['Heichelos']), h('a', { href: '/email' }, ['Inbox']), h('a', { href: '/profile' }, ['Profile'])])]);
}
