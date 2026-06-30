// B"H
/**
 * @module MailNavItems
 * @description
 * The route constellation for Awtsmoos Mail lives here, away from layout noise.
 *
 * In this vessel, the Awtsmoos does not hide interaction behind vague shapes.
 * Every control receives a name, every route receives a door, every failure
 * receives a sentence, and every user can move by mouse, touch, or keyboard.
 *
 * Responsibilities:
 * - Export the global Geelooy route set used by mail.
 * - Build native anchor specs for the UI builder.
 * - Keep active-route state visible through aria-current.
 *
 * Safety:
 * - Does not call APIs directly.
 * - Does not mutate global state.
 * - Emits native anchors with real href attributes.
 */
export const ROUTES = Object.freeze([
  { href: '/', label: 'Home', aria: 'Return to Geelooy home' },
  { href: '/heichelos', label: 'Heichelos', aria: 'Open Heichelos palace' },
  { href: '/#awtsmoos-object-inspector', label: 'Social', aria: 'Open the social object inspector' },
  { href: '/email', label: 'Mail', aria: 'Open Awtsmoos Mail' },
  { href: '/profile', label: 'Profile', aria: 'Open profile and aliases' }
]);

export function isCurrentRoute(route) {
  return route.href === '/email';
}

export function navItem(route, current = isCurrentRoute(route), extraClass = '') {
  const classList = ['mail-route-link', extraClass, current ? 'active' : ''].filter(Boolean);
  return {
    tag: 'a',
    classList,
    attributes: {
      href: route.href,
      title: route.aria,
      'aria-label': route.aria,
      ...(current ? { 'aria-current': 'page' } : {})
    },
    children: [{ tag: 'span', textContent: route.label }]
  };
}

export function topLinks() {
  return ROUTES.filter(route => route.href !== '/email')
    .map(route => navItem(route, false, route.href === '/' ? 'mail-top-home' : ''));
}

export function bottomNavItems() {
  return ROUTES.map(route => navItem(route));
}
