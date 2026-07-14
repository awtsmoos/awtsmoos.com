//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserVisualProbe
 * @description
 * Real Chrome reports premium layout evidence instead of judging screenshots by
 * assertion alone. The Awtsmoos sees every surface directly while Awtsmoos.com
 * records computed desktop, mobile, and reduced-motion contracts.
 */

export async function settle(client, milliseconds = 450) {
	return client.evaluate(`new Promise(resolve => setTimeout(resolve, ${milliseconds}))`);
}

export async function inspectHome(client) {
	return client.evaluate(`(() => {
		const shell = document.querySelector('.home-dashboard-shell');
		const title = document.getElementById('home-title');
		const dock = document.querySelector('.home-task-dock');
		return {
			premium: document.body.hasAttribute('data-premium-ui'),
			columns: getComputedStyle(shell).gridTemplateColumns,
			titleSize: parseFloat(getComputedStyle(title).fontSize),
			actions: document.querySelectorAll('.g-home-action').length,
			feed: Boolean(document.querySelector('[data-home-feed]')),
			dockPosition: getComputedStyle(dock).position,
			viewport: [innerWidth, innerHeight]
		};
	})()`);
}

export async function inspectDiscovery(client) {
	return client.evaluate(`(() => {
		const hero = document.querySelector('.spaces-hero');
		const grid = document.querySelector('.spaces-grid');
		const search = document.querySelector('.spaces-search');
		return {
			cards: document.querySelectorAll('.social-space-card').length,
			columns: getComputedStyle(grid).gridTemplateColumns,
			height: hero.getBoundingClientRect().height,
			searchPosition: getComputedStyle(search).position,
			radius: getComputedStyle(hero).borderRadius
		};
	})()`);
}

export async function inspectHeichel(client) {
	return client.evaluate(`(() => {
		const hero = document.querySelector('.geelooy-heichel-hero');
		const grid = document.querySelector('.series-list');
		const dock = document.querySelector('.geelooy-bottom-nav');
		const card = document.querySelector('.card-wrapper');
		return {
			columns: getComputedStyle(hero).gridTemplateColumns,
			cards: document.querySelectorAll('.card-wrapper').length,
			gridColumns: getComputedStyle(grid).gridTemplateColumns,
			dockDisplay: getComputedStyle(dock).display,
			dockPosition: getComputedStyle(dock).position,
			cardRadius: getComputedStyle(card).borderRadius,
			viewport: [innerWidth, innerHeight]
		};
	})()`);
}

export async function inspectReducedMotion(client) {
	return client.evaluate(`(() => {
		const card = document.querySelector('.card-wrapper');
		const hero = document.querySelector('.geelooy-heichel-hero');
		return {
			matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
			cardTransition: getComputedStyle(card).transitionDuration,
			heroAnimation: getComputedStyle(hero).animationDuration
		};
	})()`);
}
