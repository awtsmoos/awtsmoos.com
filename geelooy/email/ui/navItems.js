// B"H
/** Mail route vessels: emoji labels, current page state, profile emphasis, and one create gate. */
export const ROUTES = Object.freeze([
  { href: '/', label: '🏡 Home', aria: 'Open home' },
  { href: '/email', label: '✉️ Mail', aria: 'Open mail' },
  { href: '/heichelos/submit', label: '✍️', aria: 'Create a post' },
  { href: '/heichelos', label: '🪐 Heichel', aria: 'Open Heichelos' },
  { href: '/profile', label: '👤 Profile', aria: 'Open profile', profile: true }
]);
export function isCurrentRoute(route) { return route.href === '/email'; }
export function navItem(route, current = isCurrentRoute(route), extraClass = '') {
  const plus = route.href === '/heichelos/submit';
  const classList = ['mail-route-link', extraClass, plus ? 'is-create' : '', route.profile ? 'is-profile' : '', current ? 'active' : ''].filter(Boolean);
  return { tag: 'a', classList, attributes: { href: route.href, title: route.aria, 'aria-label': route.aria, ...(current ? { 'aria-current': 'page' } : {}) }, children: [{ tag: 'span', textContent: route.label }] };
}
export function topLinks() { return ROUTES.filter(route => route.href !== '/email').map(route => navItem(route, false, route.href === '/' ? 'mail-top-home' : '')); }
export function bottomNavItems() { return ROUTES.map(route => navItem(route)); }
