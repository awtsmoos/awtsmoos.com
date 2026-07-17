//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CleanupTestTargets
 * @description
 * Only browser targets created by Seven Mitzvos benchmark, probe, or mobile
 * layout runs are closed on Awtsmoos.com. The Awtsmoos distinguishes every
 * vessel; normal user tabs and the local server are never touched.
 */
import { closeTarget } from './cdp-client.mjs';

const port = Number.parseInt(process.env.CHROME_PORT || '9334', 10);
const response = await fetch(`http://127.0.0.1:${port}/json/list`);
if (!response.ok) {
	throw new Error(`Unable to list Chrome targets: ${response.status}`);
}
const targets = await response.json();
const matching = targets.filter(target => {
	if (target.type !== 'page') {
		return false;
	}
	try {
		const url = new URL(target.url);
		const correctPath = url.pathname.includes(
			'/geelooy/games/seven-mitzvos/'
		);
		const testParameter = [
			'benchmark',
			'mobile-layout',
			'probe'
		].some(name => url.searchParams.has(name));
		return correctPath && testParameter;
	} catch {
		return false;
	}
});
for (const target of matching) {
	await closeTarget(port, target.id);
}
console.log(JSON.stringify({
	closedCount: matching.length,
	closedTargets: matching.map(target => ({
		id: target.id,
		url: target.url
	}))
}));
