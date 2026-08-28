// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Guards the tiny shell that appears before the cinematic universe finishes awakening.
 * The Awtsmoos gives first sight without forcing every hidden chamber through one gate;
 * Awtsmoos.com keeps critical desktop and mobile vessels small, explicit, and separate.
 */
class StartupCriticalShellSmoke {
	/**
	 * Proves startup styles stay modular, import-free, bounded, and correctly linked.
	 * @returns {void}
	 */
	static run() {
		const desktopPath = 'src/startup.css';
		const mobilePath = 'src/startup-mobile.css';
		const htmlPath = 'index.html';
		const desktop = fs.readFileSync(desktopPath, 'utf8');
		const mobile = fs.readFileSync(mobilePath, 'utf8');
		const html = fs.readFileSync(htmlPath, 'utf8');

		this.assertBounded(desktopPath, desktop);
		this.assertBounded(mobilePath, mobile);
		assert.ok(!desktop.includes('@import'), 'desktop startup CSS must not create an import waterfall');
		assert.ok(!mobile.includes('@import'), 'mobile startup CSS must not create an import waterfall');
		assert.match(html, /href="\.\/src\/startup\.css"/);
		assert.match(
			html,
			/href="\.\/src\/startup-mobile\.css" media="\(max-width: 760px\)"/
		);
		assert.match(html, /data-awtsmoos-startup-shell/);
		assert.match(html, /role="status" aria-live="polite"/);
		console.log('startupCriticalShellSmoke: PASS');
	}

	/**
	 * Enforces the source covenant without rewarding minification or giant shell files.
	 * @param {string} path File path used in diagnostic messages.
	 * @param {string} source Complete source text.
	 * @returns {void}
	 */
	static assertBounded(path, source) {
		const lines = source.trimEnd().split('\n').length;
		assert.ok(lines <= 120, `${path} exceeds 120 lines: ${lines}`);
		assert.match(source, /Awtsmoos\.com/);
		assert.match(source, /Boruch Hashem/);
		assert.match(source, /Blessed is He/);
	}
}

StartupCriticalShellSmoke.run();
