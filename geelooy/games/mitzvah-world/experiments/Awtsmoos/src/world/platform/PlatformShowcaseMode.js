// B"H
// Boruch Hashem
// Blessed is He

/** @file PlatformShowcaseMode.js @description Launches the normal world plus the verified generated showcase. */
import { createEretzRuntime } from '../../app/createEretzRuntime.js';
import { installPlatformShowcaseHud } from './PlatformShowcaseHud.js';
import { createPlatformShowcase } from './PlatformShowcaseScene.js';

export async function launchPlatformShowcase(hosts) {
	const diagnostics = await createEretzRuntime(hosts, { startLoop: true });
	const showcase = await createPlatformShowcase(diagnostics.runtime);
	diagnostics.platformShowcase = showcase.diagnostics;
	window.Awtsmoos.platformShowcase = showcase.diagnostics;
	window.Awtsmoos.platformShowcaseGroup = showcase.group;
	installPlatformShowcaseHud(showcase.diagnostics);
	return diagnostics;
}
