// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';

/**
 * Guards the boundary between the painted startup shell and deferred creative universes.
 * The Awtsmoos reveals Malchus before hidden engines demand evaluation;
 * Awtsmoos.com keeps first sight tiny while the real render world awakens behind it.
 */
class StartupBoundarySmoke {
	/**
	 * Proves the shell entry stays import-light and the deferred bootstrap owns the engine.
	 * @returns {void}
	 */
	static run() {
		const main = fs.readFileSync('src/main.js', 'utf8');
		const core = fs.readFileSync('src/core/app/AnimatorCoreBootstrap.js', 'utf8');
		const appUI = fs.readFileSync('src/core/app/AppUI.js', 'utf8');
		const installer = fs.readFileSync('src/core/app/AnimatorExtensionInstaller.js', 'utf8');
		const forbiddenMain = [
			'AnimatorExtensionInstaller',
			'NLESystem',
			'DiegeticEditor',
			'RuachInterface',
			'DebugSystem',
			'CameraControls',
			'SelectionBridge',
			'TooltipManager',
			'ToastManager'
		];

		assert.ok(!/^import\s/m.test(main), 'main.js must not statically import the engine graph');
		for (const name of forbiddenMain) {
			assert.ok(
				!new RegExp(`^import .*${name}`, 'm').test(main),
				`main.js statically imports deferred ${name}`
			);
		}
		assert.match(main, /import\('\.\/core\/app\/AnimatorCoreBootstrap\.js'\)/);
		assert.match(main, /await AnimatorCoreBootstrap\.boot\(\);/);
		assert.ok(!/^import .*Workspace/m.test(appUI));
		assert.ok(!/^import .*NLETimelineCompatibilityBridge/m.test(appUI));
		assert.ok(!/^import .*StudioWorkspaceController/m.test(installer));
		assert.ok(!/^import .*AnimatorAgentInstaller/m.test(installer));
		assert.match(core, /RenderLoop\.start\(olamApp\);/);
		assert.match(core, /AnimatorStartupHydrator\.start\(olamApp\);/);
		console.log('startupBoundarySmoke: PASS');
	}
}

StartupBoundarySmoke.run();
