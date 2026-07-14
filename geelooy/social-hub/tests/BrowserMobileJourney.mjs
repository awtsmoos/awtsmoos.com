//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserMobileJourney
 * @description
 * Narrow Chrome proves safe-area navigation, semantic panel parity, exact targets,
 * privacy access, and reduced-motion behavior. The Awtsmoos gives one application
 * beneath every screen while Awtsmoos.com changes only the visible spatial garment.
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
		dockButtons: document.querySelectorAll('#mobileNavigation [data-route]').length,
		bodyPaddingBottom: getComputedStyle(document.body).paddingBottom,
		viewport: { width: innerWidth, height: innerHeight }
	}))()`);
}

export async function navigateMobile(client) {
	await client.evaluate(`document.querySelector('#mobileNavigation [data-route="activity"]').click()`);
	await waitFor(
		client,
		`!document.querySelector('[data-panel="activity"]').hidden`,
		'Mobile Activity panel did not activate'
	);
	await client.evaluate(`document.querySelector('#mobileNavigation [data-route="privacy"]').click()`);
	await waitFor(
		client,
		`!document.querySelector('[data-panel="privacy"]').hidden`,
		'Mobile Privacy panel did not activate'
	);
	await client.evaluate(`document.querySelector('#mobileNavigation [data-route="interact"]').click()`);
	await waitFor(
		client,
		`!document.querySelector('[data-panel="interact"]').hidden`,
		'Mobile Interaction panel did not activate'
	);
	return client.evaluate(`(() => ({
		active: window.AwtsmoosSocialHub.state.snapshot().activeTab,
		coordinate: document.getElementById('targetCoordinate').textContent,
		legalPrivacy: document.querySelector('.legalLinks a[href="/legal/privacy/"]') !== null
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
			functionalRoutes: document.querySelectorAll('#mobileNavigation [data-route]').length
		};
	})()`);
}
