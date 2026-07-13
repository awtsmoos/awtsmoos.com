// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NitzotzPersistenceBrowserFlow.mjs
 * @description Verifies V3 save return and the narrow-screen Nitzotz panel.
 *
 * A bond that vanishes at reload was never carried by the world. The Awtsmoos
 * renews memory and screen measure together; this flow proves the companion
 * survives both return and a smaller vessel at Awtsmoos.com.
 */
import assert from 'node:assert/strict';

const BASE = '/geelooy/games/ohr-hagnuz/src';

const installDiagnostics = client => client.evaluate(`(()=>{
	globalThis.__OHR_TEST_ERRORS__=[];
	addEventListener('error',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.error?.stack||event.message)));
	addEventListener('unhandledrejection',event=>globalThis.__OHR_TEST_ERRORS__.push(String(event.reason?.stack||event.reason)));
	return true;
})()`);

export const verifySaveAndMobile = async (client, screenshotPath) => {
	const saved = await client.evaluate(`(()=>{
		const result=OhrHaGnuzSave.saveGame(localStorage);
		return {
			ok:result.ok,
			schema:JSON.parse(localStorage.getItem('ohr-hagnuz-save-v1')).schemaVersion
		};
	})()`);
	assert.deepEqual(saved, { ok: true, schema: 3 });
	await client.send('Page.reload', { ignoreCache: true });
	await client.waitFor(`document.readyState==='complete'&&Boolean(document.querySelector('#revelation-shell'))`, 12000);
	await installDiagnostics(client);
	await client.evaluate(`(async()=>{
		const {RevelationShell}=await import('${BASE}/tiferet/revelation/RevelationShell.js');
		RevelationShell.update();
		return true;
	})()`);
	await client.waitFor(`globalThis.__OHR_HAGNUZ_REVELATION__?.leadCompanion?.name==='Nerel'`, 5000);
	await client.send('Emulation.setDeviceMetricsOverride', {
		width: 390,
		height: 844,
		deviceScaleFactor: 1,
		mobile: true
	});
	await client.evaluate(`(async()=>{document.querySelector('[data-revelation-panel="party"]')?.click();const {MobileControls}=await import('${BASE}/tiferet/ui/MobileControls.js');MobileControls.update();return true;})()`);
	await client.waitFor(`document.body.innerText.includes('Nitzotz Bonds')`, 5000);
	const mobile = await client.evaluate(`({
		mobile:matchMedia('(max-width:760px)').matches,
		name:globalThis.__OHR_HAGNUZ_REVELATION__.leadCompanion.name,
		panel:document.body.innerText.includes('Lantern Sense')
	})`);
	assert.deepEqual(mobile, { mobile: true, name: 'Nerel', panel: true });
	await client.screenshot(screenshotPath('browser-mobile-party.png'));
	const diagnostics = await client.evaluate(`({
		errors:globalThis.__OHR_TEST_ERRORS__||[],
		renderError:globalThis.__OHR_HAGNUZ_RENDER_ERROR__||null
	})`);
	assert.deepEqual(diagnostics.errors, []);
	assert.equal(diagnostics.renderError, null);
	return { saved, mobile, diagnostics };
};
