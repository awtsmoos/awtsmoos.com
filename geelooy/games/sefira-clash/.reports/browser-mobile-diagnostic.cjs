//B"H
//Boruch Hashem
//Blessed is He

const fs = require('node:fs');
const { BrowserProofHarness, delay, waitFor } = require('./BrowserProofHarness.cjs');

const output = 'geelooy/games/sefira-clash/.reports/browser-mobile-diagnostic.json';
const proof = new BrowserProofHarness({ port: 8166, reportPath: output });

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
		await waitFor('mobile menu', () => proof.page.evaluate(`Boolean(globalThis.__sefiraClashDebug)`));
		await delay(300);
		const before = await snapshot();
		const clicked = await proof.page.evaluate(`(() => {
			const button = [...document.querySelectorAll('button')]
				.find(item => item.textContent.includes('Classic Adventure'));
			if (!button) return false;
			button.click();
			return true;
		})()`);
		await delay(700);
		const after = await snapshot();
		fs.writeFileSync(output, JSON.stringify({ ok: true, clicked, before, after }, null, '\t'));
		await proof.cleanup();
	} catch (error) {
		fs.writeFileSync(output, JSON.stringify({ ok: false, error: error.stack || String(error) }, null, '\t'));
		await proof.cleanup();
		process.exitCode = 1;
	}
})();

async function snapshot() {
	return proof.page.evaluate(`(() => ({
		title: document.querySelector('.menuPanel h2')?.textContent || '',
		levelCards: document.querySelectorAll('.levelCard').length,
		customize: Boolean(document.querySelector('[data-customize-action="continue"]')),
		buttons: [...document.querySelectorAll('button')].map(button => button.textContent.replace(/\\s+/g, ' ').trim()).slice(0, 30),
		body: document.body.innerText.replace(/\\s+/g, ' ').trim().slice(0, 3000)
	}))()`);
}
