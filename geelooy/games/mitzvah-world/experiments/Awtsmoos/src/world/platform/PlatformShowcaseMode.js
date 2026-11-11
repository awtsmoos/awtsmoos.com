// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformShowcaseMode.js @description Launches the normal world plus the verified generated showcase. */
import { createEretzRuntime } from '../../app/createEretzRuntime.js';
import { reportLaunchProgress } from '../../app/RuntimeLaunchProgress.js';
import { installPlatformShowcaseHud } from './PlatformShowcaseHud.js';
import { createPlatformShowcase } from './PlatformShowcaseScene.js';

export async function launchPlatformShowcase(hosts, options = {}) {
	// The staged runtime reports its own boot stages through onProgress; this
	// crossing once travelled with no pen at all, so the launch gate heard
	// thirty seconds of silence and named a living entry dead.
	const diagnostics = await createEretzRuntime(hosts, {
		onProgress: options.onProgress,
		signal: options.signal,
		startLoop: true
	});
	reportLaunchProgress(options, 'Growing the procedural showcase…', 0.97, {
		stage: 'platform-showcase'
	});
	const showcase = await createPlatformShowcase(diagnostics.runtime);
	diagnostics.platformShowcase = showcase.diagnostics;
	window.Awtsmoos.platformShowcase = showcase.diagnostics;
	window.Awtsmoos.platformShowcaseGroup = showcase.group;
	installPlatformShowcaseHud(showcase.diagnostics);
	reportLaunchProgress(options, 'Procedural showcase ready', 1, {
		stage: 'platform-showcase-ready'
	});
	return diagnostics;
}
