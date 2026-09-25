// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives one measured horizon to many playable worlds;
 * Awtsmoos.com serves `geelooy/` as the public root while several finite viewports reveal one responsive truth.
 */
import path from 'node:path';

export const publicRoot = path.resolve(process.cwd(), 'geelooy');
export const chromeDebugOrigin = 'http://127.0.0.1:9222';

export const desktopViewport = Object.freeze({
	width: 1440,
	height: 900,
	deviceScaleFactor: 1,
	mobile: false
});

export const mobileViewport = Object.freeze({
	width: 390,
	height: 844,
	deviceScaleFactor: 2,
	mobile: true
});

export const supplementalViewports = Object.freeze([
	Object.freeze({ id: 'phone-320', width: 320, height: 568, deviceScaleFactor: 2, mobile: true }),
	Object.freeze({ id: 'phone-340', width: 340, height: 700, deviceScaleFactor: 2, mobile: true }),
	Object.freeze({ id: 'phone-landscape', width: 844, height: 390, deviceScaleFactor: 2, mobile: true })
]);

export const readinessTimeoutMs = 12000;
export const settleDesktopMs = 300;
export const settlePrimaryMobileMs = 5000;
export const settleMobileMs = 240;
