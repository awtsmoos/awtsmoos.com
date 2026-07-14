// B"H
// Boruch Hashem
// Blessed is He

import { CharacterCustomizerPanel } from './character/customizer/CharacterCustomizerPanel.js';
import { AppCore } from './core/app/AppCore.js';
import { AppUI } from './core/app/AppUI.js';
import { CameraControls } from './core/app/CameraControls.js';
import { DefaultSceneInstaller } from './core/app/DefaultSceneInstaller.js';
import { AutoPlayCovenant } from './core/playback/AutoPlayCovenant.js';
import { RenderLoop } from './core/renderer/pipeline/RenderLoop.js';
import { ToastManager } from './core/ui/toast/ToastManager.js';
import { DebugSystem } from './debug/DebugSystem.js';
import { RuachInterface } from './engine/reality/breath/RuachInterface.js';
import { DiegeticEditor } from './engine/reality/interaction/DiegeticEditor.js';
import { SelectionBridge } from './interaction/SelectionBridge.js';
import { NLESystem } from './nle/NLESystem.js';
import { CanvasSizeGuardian } from './rectification/CanvasSizeGuardian.js';
import { MobileViewportGuardian } from './rectification/MobileViewportGuardian.js';
import { CartoonStudioPanel } from './studio/CartoonStudioPanel.js';
import { TooltipManager } from './ui/components/tooltip/TooltipManager.js';

/**
 * Core reality awakens before optional editing palaces. The Awtsmoos renews the
 * app, publishes its living state immediately, starts the canvas heartbeat, and
 * then reveals each extension through an isolated gate so no panel hides another.
 */
async function boot() {
	MobileViewportGuardian.bind();
	const legacy = new URLSearchParams(location.search).get('legacy') === '1';
	prepareStorage(legacy);

	const app = new AppCore();
	window.__AWTSMOOS_PARK_APP__ = app;
	window.__AWTSMOOS_EXTENSION_STATUS__ = {};
	AppUI.setup(app);
	app.initContext('character-canvas');
	if (!app.ctx?.canvas || !app.ctx?.ctx) {
		throw new Error('B"H - Canvas context failed.');
	}

	installCore(app, legacy);
	RenderLoop.start(app);
	requestAnimationFrame(() => installExtensions(app));
}

function prepareStorage(legacy) {
	if (legacy) {
		return;
	}
	localStorage.removeItem('aw_preserve_scene');
	localStorage.setItem(
		'aw_real_character_scene',
		'real-characters-restored-v2'
	);
}

function installCore(app, legacy) {
	CanvasSizeGuardian.bind(app.ctx.canvas, app.ctx);
	DebugSystem.install(app);
	CameraControls.setup(app);
	DiegeticEditor.bind(app.ctx.canvas, app.state);
	SelectionBridge.bind(app);
	ToastManager.init();
	TooltipManager.init();
	const sequence = DefaultSceneInstaller.install(app, {
		force: !legacy,
		legacy
	});
	app.director.play(sequence, 0);
	AutoPlayCovenant.resume(app);
	NLESystem.install(app);
	bindRuach(app);
}

function bindRuach(app) {
	const awakenRuach = () => {
		RuachInterface.awaken(app.state);
		app.ctx.canvas.removeEventListener('pointerdown', awakenRuach);
	};
	app.ctx.canvas.addEventListener('pointerdown', awakenRuach, {
		once: true,
		passive: true
	});
}

function installExtensions(app) {
	safeInstall('characterLab', () => CharacterCustomizerPanel.install(app));
	safeInstall('cartoonStudio', () => CartoonStudioPanel.install(app));
	console.log(
		'B"H - [main] Optional studio extension pass complete.',
		window.__AWTSMOOS_EXTENSION_STATUS__
	);
}

function safeInstall(name, install) {
	try {
		install();
		window.__AWTSMOOS_EXTENSION_STATUS__[name] = {
			ok: true
		};
	} catch (error) {
		window.__AWTSMOOS_EXTENSION_STATUS__[name] = {
			ok: false,
			message: error?.message || String(error)
		};
		console.error(`B"H - ${name} failed to install.`, error);
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}
