// B"H
/** Mail route vessels: golden drive icons, current page state, profile emphasis, and one create gate. */
const ICON_BASE = 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/';
export const ROUTES = Object.freeze([
  { href: '/', label: 'Home', aria: 'Open home', iconClass: 'gicon--home', icon: ICON_BASE + 'media-generation-icon-home-active-0-b96032c0-3cbf-446e-9d85-7535113dcb9e.webp' },
  { href: '/email', label: 'Mail', aria: 'Open mail', iconClass: 'gicon--mail', icon: ICON_BASE + 'media-generation-icon-mail-regular-0-e8ff743a-c987-452f-b549-64e23af957fc.webp', iconHover: ICON_BASE + 'media-generation-icon-mail-hover-0-80a1e120-b5f0-4048-8993-da249ad8f2ba.webp', iconActive: ICON_BASE + 'media-generation-icon-mail-active-0-5eeb377a-c992-4008-b428-0ba9a5cff318.webp', iconFocus: ICON_BASE + 'media-generation-icon-mail-focus-0-c2c7f45e-a0fa-479b-8c54-b24c7659d3fd.webp' },
  { href: '/heichelos/submit', label: '✍️', aria: 'Create a post' },
  { href: '/heichelos', label: '🪐 Heichel', aria: 'Open Heichelos' },
  { href: '/profile', label: 'Profile', aria: 'Open profile', profile: true, iconClass: 'gicon--profile', icon: ICON_BASE + 'media-generation-icon-profile-active-0-e824a593-e9df-4597-83b4-38adf2b99e33.webp' }
]);
export function isCurrentRoute(route) { return route.href === '/email'; }
export function navItem(route, current = isCurrentRoute(route), extraClass = '') {
  const plus = route.href === '/heichelos/submit';
  const classList = ['mail-route-link', extraClass, plus ? 'is-create' : '', route.profile ? 'is-profile' : '', current ? 'active' : ''].filter(Boolean);
  const children = [];
  if (route.icon) {
    children.push({ tag: 'img', classList: ['mail-nav-icon', 'gicon', route.iconClass || ''].filter(Boolean), attributes: { src: route.icon, alt: route.label, width: '24', height: '24', ...(route.iconHover ? { 'data-icon-hover': route.iconHover } : {}), ...(route.iconActive ? { 'data-icon-active': route.iconActive } : {}), ...(route.iconFocus ? { 'data-icon-focus': route.iconFocus } : {}) } });
  }
  children.push({ tag: 'span', textContent: route.label });
  return { tag: 'a', classList, attributes: { href: route.href, title: route.aria, 'aria-label': route.aria, ...(current ? { 'aria-current': 'page' } : {}) }, children };
}
export function topLinks() { return ROUTES.filter(route => route.href !== '/email').map(route => navItem(route, false, route.href === '/' ? 'mail-top-home' : '')); }
export function bottomNavItems() { return ROUTES.map(route => navItem(route)); }
