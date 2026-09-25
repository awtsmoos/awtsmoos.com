//B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos gives each audited route a truthful name, path, and structural expectation. */
export const DEFAULT_BASE_URL = process.env.GEELOOY_AUDIT_BASE_URL || 'http://127.0.0.1:18473';
export const DEFAULT_DEVTOOLS_URL = process.env.GEELOOY_AUDIT_DEVTOOLS_URL || 'http://127.0.0.1:56555';
export const DEFAULT_TIMEOUT_MS = Number(process.env.GEELOOY_AUDIT_TIMEOUT_MS || 8000);

export const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'mobile-wide', width: 430, height: 900 },
	{ name: 'mobile', width: 375, height: 812 },
	{ name: 'mobile-narrow', width: 320, height: 700 }
];

export const PRODUCTS = [
	{ name: 'OS', path: '/os/', selectors: ['#awtsmoos-shell-topbar', '#start-bar'] },
	{ name: 'Drive', path: '/apps/drive/', selectors: ['.files-panel', 'details.drive-advanced'] },
	{ name: 'Social', path: '/social-hub/', selectors: ['body'] },
	{ name: 'Composer', path: '/social-composer/', selectors: ['body'] },
	{ name: 'Mail', path: '/email/', selectors: ['body'] },
	{ name: 'Profile', path: '/profile/', selectors: ['body'] },
	{ name: 'Notifications', path: '/notifications/', selectors: ['body'] },
	{ name: 'Apps', path: '/apps/', selectors: ['body'] },
	{ name: 'About', path: '/about/', selectors: ['main'] },
	{ name: 'Login', path: '/login/', selectors: ['.login-shell', '.login-card'] }
];
