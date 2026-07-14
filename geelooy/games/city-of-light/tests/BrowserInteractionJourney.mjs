//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserInteractionJourney
 * @description
 * Browser-side actions walk, dash, pause, change settings, and select chapters
 * through the real interface. Awtsmoos.com is tested as a playable vessel rather
 * than a static picture beneath the directing Awtsmoos.
 */

export async function walkOneStreet(client) {
	return client.evaluate(`(async () => {
		const state = window.CityOfLight.state();
		const player = state.session.player;
		const choices = [
			['ArrowRight', 1, 0],
			['ArrowDown', 0, 1],
			['ArrowLeft', -1, 0],
			['ArrowUp', 0, -1]
		];
		const choice = choices.find(([, x, y]) => {
			return state.level.grid[Math.round(player.y) + y]?.[Math.round(player.x) + x] === 0;
		});
		if (!choice) throw new Error('Spawn has no walkable neighbor');
		const before = { x: player.x, y: player.y };
		window.dispatchEvent(new KeyboardEvent('keydown', { code: choice[0] }));
		await new Promise(resolve => setTimeout(resolve, 350));
		window.dispatchEvent(new KeyboardEvent('keyup', { code: choice[0] }));
		await new Promise(resolve => setTimeout(resolve, 80));
		return { before, after: { x: player.x, y: player.y } };
	})()`);
}

export async function exerciseDash(client) {
	return client.evaluate(`(async () => {
		const state = window.CityOfLight.state();
		const player = state.session.player;
		player.abilities.add('dash');
		const before = { x: player.x, y: player.y };
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft' }));
		window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft' }));
		await new Promise(resolve => setTimeout(resolve, 100));
		return {
			before,
			after: { x: player.x, y: player.y },
			walkable: state.level.grid[Math.round(player.y)]?.[Math.round(player.x)] === 0
		};
	})()`);
}

export async function exercisePauseSettingsAndChapter(client) {
	return client.evaluate(`(async () => {
		const state = window.CityOfLight.state();
		state.progress.highestUnlocked = 4;
		state.save();
		document.getElementById('pauseButton').click();
		await new Promise(resolve => setTimeout(resolve, 80));
		const visible = document.getElementById('pauseOverlay').classList.contains('visible');
		document.getElementById('motionButton').click();
		document.getElementById('contrastButton').click();
		document.getElementById('muteButton').click();
		const chapterButton = document.querySelector('[data-chapter="3"]');
		chapterButton.click();
		await new Promise(resolve => setTimeout(resolve, 120));
		return {
			visible,
			chapter: window.CityOfLight.state().level.chapter.number,
			settings: { ...window.CityOfLight.state().settings }
		};
	})()`);
}
