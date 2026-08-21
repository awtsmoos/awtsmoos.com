//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserMobileJourney
 * @description
 * Narrow Chrome proves the stable five-action dock, More-sheet access to quieter routes, semantic panel parity, privacy reachability,
 * and reduced-motion function. The Awtsmoos gives one application beneath every screen while Awtsmoos.com changes only the visible spatial garment.
 */

import { waitFor, waitForHub } from './BrowserWait.mjs';

export async function setMobileViewport(client) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
}

export async function inspectMobile(client) {
	return client.evaluate(`(() => ({
		desktopRail: getComputedStyle(document.querySelector('.desktopRail')).display,
		mobileDock: getComputedStyle(document.getElementById('mobileNavigation')).display,
		dockRoutes: [...document.querySelectorAll('#mobileNavigation [data-route]')].map(button => button.dataset.route),
		moreExists: Boolean(document.getElementById('mobileMoreTrigger')),
		bodyPaddingBottom: getComputedStyle(document.body).paddingBottom,
		viewport: { width: innerWidth, height: innerHeight }
	}))()`);
}

async function openMore(client) {
	await client.evaluate(`document.getElementById('mobileMoreTrigger').click()`);
	await waitFor(
		client,
		`document.getElementById('mobileMoreSheet').open === true`,
		'Mobile More sheet did not open'
	);
}

async function navigateMoreRoute(client, routeId) {
	await openMore(client);
	await client.evaluate(`document.querySelector('#mobileMoreSheet [data-route="${routeId}"]').click()`);
	await waitFor(
		client,
		`!document.querySelector('[data-panel="${routeId}"]').hidden`,
		`Mobile ${routeId} panel did not activate`
	);
}

export async function navigateMobile(client) {
	await navigateMoreRoute(client, 'activity');
	await navigateMoreRoute(client, 'privacy');
	await navigateMoreRoute(client, 'interact');
	return client.evaluate(`(() => ({
		active: window.AwtsmoosSocialHub.state.snapshot().activeTab,
		coordinate: document.getElementById('targetCoordinate').textContent,
		legalPrivacy: document.querySelector('.legalLinks a[href="/legal/privacy/"]') !== null,
		moreExpanded: document.getElementById('mobileMoreTrigger').getAttribute('aria-expanded'),
		dockScrollLeft: document.getElementById('mobileNavigation').scrollLeft,
		documentOverflow: document.documentElement.scrollWidth - innerWidth
	}))()`);
}

export async function enableReducedMotion(client) {
	await client.send('Emulation.setEmulatedMedia', {
		media: 'screen',
		features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
	});
}

export async function inspectReducedMotion(client, navigate) {
	await navigate('/social-hub/?alias=teacher&heichel=study&series=lessons&post=teaching-one#home');
	await waitForHub(client);
	return client.evaluate(`(() => {
		const pulse = getComputedStyle(document.getElementById('pulseOrb'));
		const card = getComputedStyle(document.querySelector('.pulseGrid article'));
		return {
			matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
			pulseDuration: pulse.animationDuration,
			cardTransitionDuration: card.transitionDuration,
			functionalRoutes: document.querySelectorAll('#mobileNavigation [data-route]').length,
			moreExists: Boolean(document.getElementById('mobileMoreTrigger'))
		};
	})()`);
}
