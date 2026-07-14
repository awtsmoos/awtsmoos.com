//B"H
//Boruch Hashem
//Blessed is He

const { BrowserProofHarness, waitFor } = require('./BrowserProofHarness.cjs');

const proof = new BrowserProofHarness({
	port: 8165,
	reportPath: 'geelooy/games/sefira-clash/.reports/browser-resonance-mobile.json'
});

(async () => {
	try {
		await proof.start();
		await proof.page.command('Emulation.setDeviceMetricsOverride', {
			width: 390,
			height: 844,
			deviceScaleFactor: 2,
			mobile: true
		});
		await proof.page.command('Emulation.setTouchEmulationEnabled', {
			enabled: true,
			maxTouchPoints: 5
		});
		await proof.page.command('Page.reload', { ignoreCache: true });
		await waitFor('mobile main menu', () => proof.page.evaluate(`Boolean(globalThis.__sefiraClashDebug)
			&& [...document.querySelectorAll('button')].some(button => button.textContent.includes('Classic Adventure'))`));

		await proof.clickButton('Classic Adventure');
		const firstCardText = await waitFor('Adventure gate cards', () => proof.page.evaluate(`(() => {
			const card = document.querySelector('.levelCard');
			return card ? card.textContent : null;
		})()`));
		const cardSummary = await proof.page.evaluate(`(() => {
			const cards = [...document.querySelectorAll('.levelCard')];
			const first = cards[0]?.textContent || '';
			const second = cards[1]?.textContent || '';
			return {
				count: cards.length,
				firstHasFourVows: first.includes('Shlichus 0/4'),
				firstHasChochmah: first.includes('Awaken Chochmah'),
				secondHasBinah: second.includes('Test the Binah Vessel'),
				firstText: first.replace(/\\s+/g, ' ').trim().slice(0, 500)
			};
		})()`);
		if (cardSummary.count !== 60
			|| !cardSummary.firstHasFourVows
			|| !cardSummary.firstHasChochmah
			|| !cardSummary.secondHasBinah) {
			throw new Error(`Adventure card contract mismatch: ${JSON.stringify(cardSummary)}`);
		}
		proof.record('mobile-adventure-four-vow-card', cardSummary);
		if (!firstCardText) throw new Error('First Adventure card was empty.');
		await proof.page.evaluate(`document.querySelector('.levelCard').click()`);

		const adventure = await waitFor('Adventure resonance state', () => proof.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			if (state.mode !== 'adventure') return null;
			const resonance = state.powerups.find(item => item.resonanceKind);
			return resonance && state.fighters.every(fighter => fighter.resonance?.enabled)
				? {
					phase: state.phase,
					powerup: resonance,
					fighters: state.fighters.length
				}
				: null;
		})()`));
		const touch = await waitFor('mobile touch controls', () => proof.page.evaluate(`(() => {
			const controls = document.querySelector('.touchControls');
			const buttons = [...document.querySelectorAll('.touchButtons button')];
			if (!controls || !buttons.length || getComputedStyle(controls).display === 'none') return null;
			const sizes = buttons.map(button => {
				const box = button.getBoundingClientRect();
				return { action: button.dataset.act, width: box.width, height: box.height };
			});
			return sizes.every(item => item.width >= 48 && item.height >= 48)
				? { count: sizes.length, sizes }
				: null;
		})()`));
		await proof.screenshot('geelooy/games/sefira-clash/.reports/browser-resonance-mobile-adventure.png');
		proof.record('mobile-adventure-resonance', {
			adventure,
			touchButtonCount: touch.count
		});

		await proof.page.evaluate(`document.getElementById('restart').click()`);
		await waitFor('mode menu', () => proof.page.evaluate(`([...document.querySelectorAll('button')]
			.some(button => button.textContent.includes('Open World')))`));
		await proof.openWorld();
		const shape = await proof.shape();
		const door = shape.doors.find(item => item.destination === 'shlichus');
		if (!door) throw new Error('Shlichus House door missing.');
		await proof.moveToX(door.x + door.w / 2, 34);
		await waitFor('Shlichus House prompt', () => proof.page.evaluate(`(() => {
			const prompt = globalThis.__sefiraClashDebug.openWorld().state.prompt;
			return prompt.includes('Shlichus House') ? prompt : null;
		})()`));
		await proof.press('Enter', 'Enter', 18);
		await waitFor('buffered mobile-width doorway entry', () => proof.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.interiorId === 'shlichus'`));
		const performance = await proof.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.openWorld().state;
			return {
				last: state.performance.last,
				samples: state.performance.samples.length,
				activeCitizens: state.activeCitizenCount,
				sleepingCitizens: state.sleepingCitizenCount
			};
		})()`);
		if (performance.samples > 180
			|| performance.activeCitizens > 12
			|| performance.last.ambientParticles > 48) {
			throw new Error(`Open World budget exceeded: ${JSON.stringify(performance)}`);
		}
		await proof.screenshot('geelooy/games/sefira-clash/.reports/browser-resonance-mobile-openworld.png');
		proof.record('buffered-door-and-performance', {
			interiorId: 'shlichus',
			performance
		});
		await proof.finish();
	} catch (error) {
		await proof.fail(error);
		process.exitCode = 1;
	}
})();
