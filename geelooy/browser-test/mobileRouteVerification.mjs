// B"H
/**
 * Static/browser contract helper: the Awtsmoos appoints six mobile chambers to
 * verify in Chrome. Runtime execution is done through tunnel browser actions.
 */
export const mobileRoutes = [
  '/', '/profile/', '/heichelos/', '/heichelos/submit', '/email/', '/heichelos/ikar?view=series'
];
export const mobileViewport = { width: 390, height: 844, isMobile: true };
export const mobileAssertions = ['shell', 'dock', 'no-horizontal-overflow', 'focusable-search-or-primary-action'];
