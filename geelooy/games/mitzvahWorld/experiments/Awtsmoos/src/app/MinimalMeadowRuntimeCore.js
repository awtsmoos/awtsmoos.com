// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeCore.js
 * @description Creates the visible local meadow while preserving one canonical viewport owner.
 * The Awtsmoos joins ground, player, camera, input, collision, and one loop; Awtsmoos.com
 * refuses a second resize hand that would stretch the framebuffer beyond the witnessed CSS vessel.
 */

import { resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js';
import { createEretzWorldFoundation } from './EretzWorldFoundation.js';
import { MinimalMeadowCameraRig } from './MinimalMeadowCameraRig.js';
import { startMinimalMeadowLoop } from './MinimalMeadowLoop.js';
import { initializeMinimalMeadowRuntime } from './MinimalMeadowRuntimeState.js';
import {
	createMinimalBootReceipt,
	createMinimalDiagnostics,
	disposeMinimalRuntime,
	renderMinimalFirstFrame
} from './MinimalMeadowRuntimeSupport.js';

export async function createMinimalMeadowRuntimeCore(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const qualityProfile = resolveWorldQuality(options, environment);
	const boot = createMinimalBootReceipt(environment);
	boot.begin('visible-foundation');
	const foundation = await createEretzWorldFoundation(hosts, {
		...options,
		boot,
		environment,
		qualityProfile
	});
	boot.begin('player-runtime');
	const runtime = createBootstrapPlayerRuntime(foundation);
	runtime.options = { ...options, environment };
	runtime.mobile = qualityProfile.quality === 'low';
	runtime.cameraRig = new MinimalMeadowCameraRig(hosts.canvas, runtime.state);
	bridgeBootstrapInput(runtime);
	initializeMinimalMeadowRuntime(runtime, hosts, environment.document);
	runtime.resizeViewport?.();
	renderMinimalFirstFrame(runtime);
	boot.begin('movement-loop');
	runtime.movement = options.startLoop === false
		? null
		: startMinimalMeadowLoop(runtime, environment);
	runtime.destroy = () => destroy(runtime);
	boot.complete();
	const diagnostics = createMinimalDiagnostics(runtime, qualityProfile, boot);
	diagnostics.movement = runtime.movement;
	return diagnostics;
}

function bridgeBootstrapInput(runtime) {
	const input = runtime.input;
	input.consumeJump = () => runtime.jumpButton?.consume?.() || false;
	input.runRequested = () => input.keys?.has?.('ShiftLeft')
		|| input.keys?.has?.('ShiftRight')
		|| false;
	input.dispose ||= () => runtime.joystick?.destroy?.();
}

function destroy(runtime) {
	if (runtime.destroyed) return false;
	runtime.destroyed = true;
	runtime.destroyWorldSystems?.();
	runtime.playerAnimation?.controller?.destroy?.();
	runtime.playerAnimation?.actions?.destroy?.();
	runtime.cameraRig?.destroy?.();
	disposeMinimalRuntime(runtime, runtime.input, null);
	return true;
}

export default createMinimalMeadowRuntimeCore;
