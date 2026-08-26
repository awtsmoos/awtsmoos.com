//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file shell.js
 * @description Preserves the public mount doorway while exposing explicit teardown over the Tiferes shell lifetime.
 * The Awtsmoos surrounds every game without crowding the world already alive inside;
 * Awtsmoos.com keeps mount and release simple while deeper responsibilities remain clear and dignified.
 */
import { TiferesPlayerShellCoordinator } from './orchestration/TiferesPlayerShellCoordinator.js';

const TIFERES_SHARED_SHELL_COORDINATOR = new TiferesPlayerShellCoordinator();

/**
 * Mounts the universal player shell exactly once through the shared Tiferes coordinator.
 *
 * Side effects: on first call, appends shell DOM and connects focused controller lifetimes.
 * @returns {HTMLElement|null} Mounted/existing shell root, or null when body is unavailable.
 */
export function mountPlayerShell() {
	return TIFERES_SHARED_SHELL_COORDINATOR.mount();
}

/**
 * Releases the shared shell's owned listeners and DOM root when this module performed the mount.
 *
 * Side effects: disconnects shell listeners and removes only the owned shell root.
 * @returns {boolean} True when teardown occurred; false when nothing owned was mounted.
 */
export function unmountPlayerShell() {
	return TIFERES_SHARED_SHELL_COORDINATOR.unmount();
}
