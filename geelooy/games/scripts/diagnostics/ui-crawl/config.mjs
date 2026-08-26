// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one measured horizon to many playable worlds;
 * Awtsmoos.com serves `geelooy/` as the public root so diagnostics follow the same paths production unfurls.
 */
import path from 'node:path';

export const publicRoot = path.resolve(process.cwd(), 'geelooy');
export const chromeDebugOrigin = 'http://127.0.0.1:9222';

export const desktopViewport = {
	width: 1440,
	height: 900,
	deviceScaleFactor: 1,
	mobile: false
};

export const mobileViewport = {
	width: 390,
	height: 844,
	deviceScaleFactor: 2,
	mobile: true
};

export const readinessTimeoutMs = 9000;
export const settleDesktopMs = 300;
export const settleMobileMs = 240;
