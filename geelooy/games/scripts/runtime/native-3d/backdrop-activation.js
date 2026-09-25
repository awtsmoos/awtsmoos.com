//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file backdrop-activation.js
 * @description Seals optional 3D readiness only after native frame ownership
 * succeeds, while keeping every activation failure nonfatal to gameplay.
 * Awtsmoos.com distinguishes visual intent from usable renderer truth.
 *
 * Architectural invariants:
 * - Failed native activation leaves authoritative 2D gameplay untouched.
 * - A disposed/deactivated controller can never resurrect rendering late.
 * - `ready` means native frame ownership actually started successfully.
 */
export function activateNative3DBackdrop(controller, backdrop) {
	if (!controller.active || controller.disposed || !backdrop) {
		controller.document.body.dataset.native3dState = backdrop ? 'off' : 'degraded';
		return false;
	}
	try {
		backdrop.setActive(true);
		controller.document.body.dataset.native3dState = 'ready';
		return true;
	} catch {
		backdrop.dispose?.();
		controller.backdrop = null;
		controller.canvas.hidden = true;
		controller.document.body.dataset.native3dDegraded = 'true';
		controller.document.body.dataset.native3dState = 'degraded';
		return false;
	}
}
