//B"H
//Boruch Hashem
//Blessed is He

const { BrowserProofHarness, delay, waitFor } = require('./BrowserProofHarness.cjs');

const proof = new BrowserProofHarness({
	port: 8161,
	reportPath: 'geelooy/games/sefira-clash/.reports/browser-phase-patrol.json'
});

(async () => {
	try {
		await proof.start();
		await proof.openWorld();
		const initial = await proof.shape();
		proof.record('open-world-shape', {
			doors: initial.doors.length,
			traversalNodes: initial.nodes.length,
			citizens: initial.citizens.length
		});

		await proof.enterDoor('shlichus');
		proof.record('entered-shlichus');
		await proof.useService();
		const accepted = await proof.page.evaluate(`(() => {
			const card = [...document.querySelectorAll('.openWorldCard')]
				.find(item => item.textContent.includes('Three-Point Patrol'));
			const button = card?.querySelector('button');
			if (!button) return false;
			button.click();
			return true;
		})()`);
		if (!accepted) throw new Error('Three-Point Patrol accept button missing.');
		await waitFor('patrol active', () => proof.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']?.status === 'active'`));
		proof.record('patrol-accepted');
		await proof.closeOverlay();
		await proof.exitInterior();

		const patrols = (await proof.shape()).nodes
			.filter(node => node.kind === 'patrol')
			.sort((left, right) => left.x - right.x);
		for (const patrol of patrols) {
			await proof.moveToX(patrol.x + patrol.w / 2, 34);
			await waitFor(`patrol prompt ${patrol.id}`, async () => {
				const prompt = await proof.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().state.prompt`);
				return prompt.includes('Patrol') ? prompt : null;
			});
			await proof.press('Enter', 'Enter');
			await delay(160);
			proof.record('patrol-seal', { id: patrol.id });
		}
		const progressed = await waitFor('patrol return stage', () => proof.page.evaluate(`(() => {
			const mission = globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol'];
			return mission?.stageIndex === 1 ? mission : null;
		})()`));
		proof.record('patrol-three-seals-complete', { progressed });

		await proof.enterDoor('shlichus');
		await waitFor('patrol complete', () => proof.page.evaluate(`globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol']?.status === 'complete'`));
		await proof.useService();
		const claimed = await proof.page.evaluate(`(() => {
			const card = [...document.querySelectorAll('.openWorldCard')]
				.find(item => item.textContent.includes('Three-Point Patrol'));
			const button = card?.querySelector('button');
			if (!button) return false;
			button.click();
			return true;
		})()`);
		if (!claimed) throw new Error('Three-Point Patrol claim button missing.');
		const finalMission = await waitFor('patrol claimed', () => proof.page.evaluate(`(() => {
			const mission = globalThis.__sefiraClashDebug.openWorld().profile.missions['three-point-patrol'];
			return mission?.status === 'claimed' ? mission : null;
		})()`));
		await proof.screenshot('geelooy/games/sefira-clash/.reports/browser-phase-patrol.png');
		proof.record('patrol-claimed', { finalMission });
		await proof.finish();
	} catch (error) {
		await proof.fail(error);
		process.exitCode = 1;
	}
})();
