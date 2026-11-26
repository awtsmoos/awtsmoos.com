// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncherBundle.js
 * @description Prebuilt entry for the boot launcher chain (page boot, session
 * mode, boot phase tracker, staged runtime). These modules gate the menu and
 * world creation; serving them as one prebuilt chunk removes their graphs from
 * the runtime server-compile path, which stalls or times out under load. The
 * embedded runtime-page door stays on the compact path: its graph trips a
 * compiler resolution fault (light-three-gltf tiny-runtime) when bundled.
 */

export {
	ensureMitzvahWorldPageBoot,
	bootMitzvahWorldPage,
	resolveHosts
} from '../launcher/bootMitzvahWorldPage.js';
export {
	mitzvahWorldSessionMode,
	resolveMitzvahWorldSessionMode
} from '../launcher/MitzvahWorldSessionMode.js';
export { BootPhaseTracker } from './BootPhaseTracker.js';
export { createStagedEretzRuntime } from './EretzStagedRuntime.js';
