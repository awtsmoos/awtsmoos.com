// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeColorDiagnostic.mjs
 * @description
 * Real Chrome records the exact cascade owner for the Home sidebar primary label.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createBrowserHarness } from '../../games/city-of-light/tests/BrowserHarness.mjs';
import { API_FIXTURE_SOURCE } from './ApiFixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const directory = path.resolve(here, '../..');
const harness = await createBrowserHarness({
	directory,
	port: 44137
});
let fixtureIdentifier = '';

try {
	fixtureIdentifier = (await harness.client.send(
		'Page.addScriptToEvaluateOnNewDocument',
		{ source: API_FIXTURE_SOURCE }
	)).identifier;
	await harness.client.send('Network.setCacheDisabled', {
		cacheDisabled: true
	});
	await harness.client.send('Emulation.setDeviceMetricsOverride', {
		width: 1440,
		height: 1000,
		deviceScaleFactor: 1,
		mobile: false
	});
	await harness.navigate('/');
	await new Promise(resolve => setTimeout(resolve, 700));
	const result = await harness.client.evaluate(`(() => {
		const node = document.querySelector('.g-route-list span');
		const style = getComputedStyle(node);
		const rules = [];
		const walk = sheet => {
			let list;
			try { list = [...sheet.cssRules]; } catch { return; }
			for (const rule of list) {
				if (rule.styleSheet) walk(rule.styleSheet);
				if (!rule.selectorText || !rule.style?.color) continue;
				try {
					if (node.matches(rule.selectorText)) rules.push({
						selector: rule.selectorText,
						color: rule.style.color,
						important: rule.style.getPropertyPriority('color'),
						href: sheet.href || 'inline'
					});
				} catch {}
			}
		};
		for (const sheet of [...document.styleSheets]) walk(sheet);
		return {
			text: node.textContent,
			color: style.color,
			background: getComputedStyle(node.closest('.g-side-card')).backgroundColor,
			rules,
			stylesheets: [...document.styleSheets].map(sheet => sheet.href || 'inline')
		};
	})()`);
	console.log(JSON.stringify(result, null, 2));
} finally {
	if (fixtureIdentifier) {
		await harness.client.send('Page.removeScriptToEvaluateOnNewDocument', {
			identifier: fixtureIdentifier
		}).catch(() => null);
	}
	harness.close();
}
