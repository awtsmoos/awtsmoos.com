//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserFutureLayoutJourney
 * @description
 * The Awtsmoos gives every futuristic surface a measurable vessel instead of a visual guess;
 * Awtsmoos.com reads real Chrome geometry so Discovery, Hero, and mobile containment may prove their breadth and finesse.
 */
export async function inspectFutureDesktopLayout(client) {
	return client.evaluate(`(() => {
		const home = document.querySelector('[data-panel="home"]');
		const discovery = document.querySelector('.publicDiscovery');
		const hero = document.querySelector('.heroRift');
		const pulse = document.getElementById('pulseOrb');
		const homeBox = home.getBoundingClientRect();
		const discoveryBox = discovery.getBoundingClientRect();
		const heroBox = hero.getBoundingClientRect();
		const pulseBox = pulse.getBoundingClientRect();
		const discoveryStyle = getComputedStyle(discovery);
		const homeStyle = getComputedStyle(home);
		return {
			viewportWidth: innerWidth,
			homeWidth: homeBox.width,
			discoveryWidth: discoveryBox.width,
			discoveryInlineSize: discoveryStyle.inlineSize,
			discoveryContainerType: discoveryStyle.containerType,
			discoveryJustifySelf: discoveryStyle.justifySelf,
			heroWidth: heroBox.width,
			pulseWidth: pulseBox.width,
			gridColumns: homeStyle.gridTemplateColumns,
			documentOverflow: document.documentElement.scrollWidth - innerWidth
		};
	})()`);
}

export async function inspectFutureMobileLayout(client) {
	return client.evaluate(`(() => {
		const discovery = document.querySelector('.publicDiscovery');
		const header = discovery.querySelector('.publicDiscovery__header');
		const lookup = discovery.querySelector('.publicDiscovery__lookup');
		const discoveryBox = discovery.getBoundingClientRect();
		return {
			viewportWidth: innerWidth,
			discoveryWidth: discoveryBox.width,
			discoveryLeft: discoveryBox.left,
			discoveryRight: discoveryBox.right,
			headerColumns: getComputedStyle(header).gridTemplateColumns,
			lookupColumns: getComputedStyle(lookup).gridTemplateColumns,
			documentOverflow: document.documentElement.scrollWidth - innerWidth
		};
	})()`);
}

export async function setFutureMobileViewport(client) {
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 2,
		mobile: true
	});
}
