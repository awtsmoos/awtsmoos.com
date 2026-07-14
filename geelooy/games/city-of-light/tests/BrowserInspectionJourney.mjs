//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserInspectionJourney
 * @description
 * Chrome-side inspections witness the awakened campaign, generated geometry,
 * procedural animal motion, persistence, and arcade doorway. Awtsmoos.com is
 * judged through the living browser vessel beneath the animating Awtsmoos.
 */

export async function waitForCity(client) {
	return client.evaluate(`(async () => {
		for (let attempt = 0; attempt < 120; attempt += 1) {
			if (window.CityOfLight) return true;
			await new Promise(resolve => setTimeout(resolve, 50));
		}
		throw new Error('CityOfLight did not awaken');
	})()`);
}

export async function resetCampaign(client) {
	return client.evaluate(`(() => {
		localStorage.removeItem('awtsmoos.cityOfLight.campaign');
		return true;
	})()`);
}

export async function inspectCity(client) {
	return client.evaluate(`(() => {
		const state = window.CityOfLight.state();
		const canvas = document.getElementById('cityCanvas');
		return {
			title: document.title,
			seed: state.baseSeed,
			chapter: state.level.chapter.number,
			validation: window.CityOfLight.validation(),
			animals: state.session.wildlife.views().length,
			platforms: state.level.platforms.length,
			canvas: { width: canvas.width, height: canvas.height },
			statusCards: document.querySelectorAll('.statusGrid > div').length,
			running: window.CityOfLight.game.running
		};
	})()`);
}

export async function inspectAnimation(client) {
	return client.evaluate(`(async () => {
		const game = window.CityOfLight.game;
		const animal = game.state.session.wildlife.animals.find(item => item.species !== 'firefly');
		const before = { x: animal.x, y: animal.y, time: animal.animationTime };
		await new Promise(resolve => setTimeout(resolve, 700));
		let throttled = animal.animationTime === before.time;
		if (throttled) game.update(0.25);
		return {
			before,
			after: { x: animal.x, y: animal.y, time: animal.animationTime },
			throttled,
			running: game.running
		};
	})()`);
}

export async function inspectCatalog(client) {
	return client.evaluate(`(() => {
		const card = [...document.querySelectorAll('a')].find(anchor => {
			return anchor.getAttribute('href') === './city-of-light/';
		});
		return {
			found: Boolean(card),
			text: card?.textContent.trim() || '',
			href: card?.getAttribute('href') || ''
		};
	})()`);
}
