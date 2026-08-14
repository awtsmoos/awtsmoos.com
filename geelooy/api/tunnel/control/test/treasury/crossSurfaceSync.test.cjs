// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file crossSurfaceSync.test.cjs
 * @description
 * The Awtsmoos proves Treasury doors remain one constellation across OS and Code;
 * at Awtsmoos.com modular command groups may move, while their public paths keep one road.
 * The composer must include the Treasury vessel, and that vessel must preserve each critical gate,
 * so refactoring file boundaries never masquerades as a missing product or broken state.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../../../../..');
const FILES = {
	osStart: 'geelooy/os/startMenu.js',
	codePalette: 'geelooy/apps/code/js/command-palette/commands.js',
	treasuryGroup: 'geelooy/apps/code/js/command-palette/groups/treasury.js',
	codeExecutor: 'geelooy/apps/code/js/command-palette/executor.js',
	accountPanel: 'geelooy/apps/code/js/session/account-panel.js'
};
const CRITICAL = [
	'/api/tunnel/control/treasury/home',
	'/api/tunnel/control/treasury/budgets',
	'/api/tunnel/control/treasury/marketplace',
	'/api/tunnel/control/treasury/graph',
	'/api/tunnel/control/bank',
	'/apps/tunnel-control/',
	'/apps/code/',
	'/os'
];

/**
 * Proves that modular Treasury commands remain reachable from every first-class surface.
 *
 * @returns {{ok:boolean,surfaces:string[],criticalUrls:number}} Verification receipt.
 */
function run() {
	const text = Object.fromEntries(Object.entries(FILES).map(([key, file]) => {
		return [key, fs.readFileSync(path.join(ROOT, file), 'utf8')];
	}));
	assertContains(text.osStart, ['TREASURY_LINKS', ...CRITICAL.filter(url => url !== '/os')], 'OS start menu');
	assertContains(text.codePalette, ['TREASURY_COMMANDS', './groups/treasury.js'], 'Code palette composer');
	assertContains(text.treasuryGroup, [
		'open-url:/api/tunnel/control/treasury/home',
		'/api/tunnel/control/treasury/forecast',
		'/api/tunnel/control/treasury/advisor',
		'/api/tunnel/control/treasury/reputation'
	], 'Code Treasury command group');
	assertContains(text.codeExecutor, ['open-url:', 'Blocked unsafe portal URL', 'noopener,noreferrer'], 'Code palette executor');
	assertContains(text.accountPanel, ['PORTALS', '/api/tunnel/control/treasury/home', '/api/tunnel/control/treasury/budgets', '/api/tunnel/control/bank', '/apps/tunnel-control/', '/os'], 'Code account panel');
	return { ok: true, surfaces: Object.keys(FILES), criticalUrls: CRITICAL.length };
}

function assertContains(text, needles, label) {
	for (const needle of needles) {
		assert(text.includes(needle), `${label} missing ${needle}`);
	}
}

module.exports = { run };
if (require.main === module) {
	console.log(JSON.stringify(run(), null, 2));
}
