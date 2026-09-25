// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos turns viewport, shell, and surface geometry into witnesses rather than feelings;
 * Awtsmoos.com applies each route's true covenant and names the finite element that widens a world beyond its glass.
 */
import { classifySurface } from './surface-contract.mjs';
import { classifyViewportSuite } from './viewport-contract.mjs';

export const desktopExpression = `(() => {
	const shell = document.querySelector('[data-awt-game-shell]');
	const visual = [...document.querySelectorAll('canvas, video, svg')]
		.map(element => {
			const rect = element.getBoundingClientRect();
			return [element.tagName.toLowerCase(), Math.round(rect.width), Math.round(rect.height)];
		})
		.sort((a, b) => (b[1] * b[2]) - (a[1] * a[2]))[0] || null;
	return {
		readyState: document.readyState,
		title: document.title.trim(),
		shellCount: document.querySelectorAll('[data-awt-game-shell]').length,
		allGamesHref: shell?.querySelector('.awt-game-shell__action--primary')?.getAttribute('href') || '',
		overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
		primaryVisual: visual
	};
})()`;

export const mobileExpression = `(() => {
	const shell = document.querySelector('[data-awt-game-shell]');
	const launcher = shell?.querySelector('.awt-game-shell__launcher');
	const panel = shell?.querySelector('.awt-game-shell__panel');
	if (launcher && panel?.hidden) launcher.click();
	const measure = rect => rect ? ({ left: Math.round(rect.left), top: Math.round(rect.top), right: Math.round(rect.right), bottom: Math.round(rect.bottom), width: Math.round(rect.width), height: Math.round(rect.height) }) : null;
	const overflowWitnesses = [...document.querySelectorAll('body *')]
		.map(element => ({ element, rect: element.getBoundingClientRect() }))
		.filter(({ element, rect }) => {
			const style = getComputedStyle(element);
			return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && rect.width > 0 && (rect.right > innerWidth + 2 || rect.left < -2);
		})
		.sort((a, b) => Math.max(b.rect.right - innerWidth, -b.rect.left) - Math.max(a.rect.right - innerWidth, -a.rect.left))
		.slice(0, 12)
		.map(({ element, rect }) => ({
			name: element.id ? '#' + element.id : element.classList.length ? '.' + [...element.classList].slice(0, 3).join('.') : element.tagName.toLowerCase(),
			rect: measure(rect)
		}));
	return {
		overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
		overflowWitnesses,
		viewport: [innerWidth, innerHeight],
		launcher: measure(launcher?.getBoundingClientRect()),
		panel: measure(panel?.getBoundingClientRect()),
		panelOpen: Boolean(panel && !panel.hidden)
	};
})()`;

export function decorateMobileMetrics(metrics) {
	const [width, height] = metrics.viewport || [390, 844];
	return { ...metrics, launcherInViewport: inside(metrics.launcher, width, height), panelInViewport: inside(metrics.panel, width, height) };
}

export function classifyAudit(record) {
	const issues = [];
	const shellRequired = record.shellRequired !== false;
	if (!record.ready) issues.push('readiness-timeout');
	if (shellRequired) {
		if (record.desktop.shellCount !== 1) issues.push(`shell-count:${record.desktop.shellCount}`);
		if (record.desktop.allGamesHref !== '/games/') issues.push(`all-games-href:${record.desktop.allGamesHref || 'missing'}`);
		if (!record.mobile.launcherInViewport) issues.push('mobile-launcher-outside-viewport');
		if (!record.mobile.panelInViewport) issues.push('mobile-panel-outside-viewport');
		if (!record.mobile.panelOpen) issues.push('mobile-shell-panel-did-not-open');
	}
	if (record.desktop.overflowX) issues.push('desktop-horizontal-overflow');
	if (record.mobile.overflowX) issues.push('mobile-horizontal-overflow');
	issues.push(...classifySurface(record.mobile.surface));
	issues.push(...classifyViewportSuite(record.viewports, { shellRequired }));
	if (!record.desktop.title) issues.push('empty-title');
	if (record.exceptions.length) issues.push(`runtime-exceptions:${record.exceptions.length}`);
	if (record.networkFailures.length) issues.push(`network-failures:${record.networkFailures.length}`);
	const unexpected = record.badResponses.filter(response => !isApiResponse(response.url));
	if (unexpected.length) issues.push(`unexpected-http-errors:${unexpected.length}`);
	return issues;
}

function inside(rect, width, height) {
	return Boolean(rect && rect.left >= -1 && rect.top >= -1 && rect.right <= width + 1 && rect.bottom <= height + 1);
}

function isApiResponse(url) {
	try { return new URL(url).pathname.startsWith('/api/'); } catch { return false; }
}
