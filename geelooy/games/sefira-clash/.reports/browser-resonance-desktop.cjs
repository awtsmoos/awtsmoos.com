//B"H
//Boruch Hashem
//Blessed is He

const { BrowserProofHarness, waitFor } = require('./BrowserProofHarness.cjs');

const proof = new BrowserProofHarness({
	port: 8164,
	reportPath: 'geelooy/games/sefira-clash/.reports/browser-resonance-desktop.json'
});

(async () => {
	try {
		await proof.start();
		await proof.clickButton('Quick VS');
		await waitFor('Resonance Clash preset', () => proof.page.evaluate(`(() => {
			const button = document.querySelector('[data-mode-id="resonance"]');
			return button && button.textContent.includes('Chochmah + Binah')
				? button.textContent.replace(/\s+/g, ' ').trim()
				: null;
		})()`));
		await proof.page.evaluate(`document.querySelector('[data-mode-id="resonance"]').click()`);
		await waitFor('selected resonance preset', () => proof.page.evaluate(`document.querySelector('[data-mode-id="resonance"]')?.getAttribute('aria-pressed') === 'true'`));
		proof.record('resonance-preset-selected');

		const cpuActivated = await proof.page.evaluate(`(() => {
			const slots = [...document.querySelectorAll('.lobbySlot')];
			const seatSelect = slots[1]?.querySelector('select');
			if (!seatSelect) return false;
			seatSelect.value = 'cpu';
			seatSelect.dispatchEvent(new Event('change', { bubbles: true }));
			return true;
		})()`);
		if (!cpuActivated) throw new Error('Seat 2 CPU selector was unavailable.');
		await waitFor('Seat 2 CPU ready', () => proof.page.evaluate(`(() => {
			const slots = [...document.querySelectorAll('.lobbySlot')];
			return slots[1]?.textContent.includes('CPU Ready') || false;
		})()`));
		proof.record('lawful-two-fighter-roster');

		const p1Readiness = await proof.page.evaluate(`(() => {
			const firstSlot = document.querySelector('.lobbySlot');
			const button = firstSlot?.querySelector('button');
			if (!button) return { found: false };
			const before = button.textContent.trim();
			if (before.includes('Press Ready')) button.click();
			return { found: true, before, clicked: before.includes('Press Ready') };
		})()`);
		if (!p1Readiness.found) throw new Error('P1 readiness control was unavailable.');
		await waitFor('choose arena enabled', () => proof.page.evaluate(`(() => {
			const button = [...document.querySelectorAll('button')]
				.find(item => item.textContent.includes('Choose Arena'));
			return Boolean(button && !button.disabled);
		})()`));
		proof.record('p1-ready', p1Readiness);
		await proof.clickButton('Choose Arena');
		await waitFor('arena grid', () => proof.page.evaluate(`document.querySelectorAll('.menuCard').length > 0`));
		await proof.page.evaluate(`document.querySelector('.menuCard').click()`);

		const state = await waitFor('authoritative resonance match state', () => proof.page.evaluate(`(() => {
			const state = globalThis.__sefiraClashDebug.state();
			if (state.mode !== 'vs' || !state.rules?.resonance) return null;
			return {
				phase: state.phase,
				rules: state.rules,
				powerups: state.powerups,
				fighters: state.fighters.map(fighter => ({
					id: fighter.id,
					enabled: fighter.resonance?.enabled,
					stats: fighter.resonance?.stats
				}))
			};
		})()`));
		const powerupIds = [...new Set(state.powerups.map(item => item.id))];
		if (!state.rules.items || state.rules.handsOnly) {
			throw new Error(`Invalid Resonance Clash rules: ${JSON.stringify(state.rules)}`);
		}
		if (!powerupIds.length || powerupIds.some(id => !['chochmahFlash', 'binahVessel'].includes(id))) {
			throw new Error(`Unexpected powerup pool: ${JSON.stringify(powerupIds)}`);
		}
		if (!state.fighters.every(fighter => fighter.enabled === true)) {
			throw new Error(`Fighter resonance not enabled: ${JSON.stringify(state.fighters)}`);
		}
		const raf = await proof.page.evaluate(`new Promise(resolve => {
			const samples = [];
			let previous = 0;
			function frame(now) {
				if (previous) samples.push(now - previous);
				previous = now;
				if (samples.length >= 120) {
					const ordered = [...samples].sort((a, b) => a - b);
					resolve({
						frames: samples.length,
						averageMs: samples.reduce((sum, value) => sum + value, 0) / samples.length,
						p95Ms: ordered[Math.floor(ordered.length * 0.95)]
					});
					return;
				}
				requestAnimationFrame(frame);
			}
			requestAnimationFrame(frame);
		})`);
		await proof.screenshot('geelooy/games/sefira-clash/.reports/browser-resonance-desktop.png');
		proof.record('authoritative-resonance-match', {
			phase: state.phase,
			rules: state.rules,
			powerupIds,
			fighterCount: state.fighters.length,
			raf
		});
		await proof.finish();
	} catch (error) {
		await proof.fail(error);
		process.exitCode = 1;
	}
})();
