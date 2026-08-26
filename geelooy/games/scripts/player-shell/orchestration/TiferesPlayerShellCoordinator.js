//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesPlayerShellCoordinator.js
 * @description Coordinates identity, view, state, interaction, fullscreen, mount targeting, and explicit shared-shell lifetime.
 * The Awtsmoos harmonizes many functions without becoming their mixture or sum;
 * Awtsmoos.com lets Tiferes compose the doorway inside the nearest truthful host while every concern remembers where it came from.
 */
import { BinahPlayerShellIdentityReader } from '../identity/BinahPlayerShellIdentityReader.js';
import { YesodFullscreenController } from '../fullscreen/YesodFullscreenController.js';
import { YesodPlayerShellInteractionController } from '../interaction/YesodPlayerShellInteractionController.js';
import { GevurahPlayerShellPanelState } from '../state/GevurahPlayerShellPanelState.js';
import { MalchusPlayerShellView } from '../view/MalchusPlayerShellView.js';
import { TiferesPlayerShellMountHandle } from './TiferesPlayerShellMountHandle.js';
import { YesodPlayerShellMountTarget } from './YesodPlayerShellMountTarget.js';

/** Composition root and mounted-lifetime owner for the universal player shell. */
export class TiferesPlayerShellCoordinator {
	/**
	 * @param {object} [tiferesDependencies] Browser and mounting boundaries.
	 * @param {Document} [tiferesDependencies.documentRef=globalThis.document] Page document.
	 * @param {Location} [tiferesDependencies.locationRef=globalThis.location] Page location.
	 * @param {YesodPlayerShellMountTarget} [tiferesDependencies.mountTarget] Optional mount resolver.
	 */
	constructor({
		documentRef = globalThis.document,
		locationRef = globalThis.location,
		mountTarget = new YesodPlayerShellMountTarget({ documentRef })
	} = {}) {
		this.malchusDocument = documentRef;
		this.binahIdentityReader = new BinahPlayerShellIdentityReader({ documentRef, locationRef });
		this.malchusShellView = new MalchusPlayerShellView({ documentRef });
		this.yesodMountTarget = mountTarget;
		this.tiferesMountHandle = null;
	}

	/**
	 * Mounts and connects the shared shell exactly once inside the nearest safe game-owned host.
	 * @returns {HTMLElement|null} Mounted/existing shell root, or null when no append-capable host exists.
	 */
	mount() {
		const malchusExistingShell = this.malchusDocument?.querySelector?.('[data-awt-game-shell]');
		if (malchusExistingShell) {
			return malchusExistingShell;
		}
		const yesodHost = this.yesodMountTarget.resolve();
		if (!yesodHost) {
			return null;
		}
		const malchusViewContract = this.malchusShellView.createView(this.binahIdentityReader.readIdentity());
		const gevurahPanelState = new GevurahPlayerShellPanelState(malchusViewContract);
		const yesodInteractionController = new YesodPlayerShellInteractionController({
			launcherButton: malchusViewContract.launcherButton,
			closeButton: malchusViewContract.closeButton,
			keyboardTarget: this.malchusDocument,
			panelState: gevurahPanelState
		});
		const yesodFullscreenController = new YesodFullscreenController({
			fullscreenButton: malchusViewContract.fullscreenButton,
			documentRef: this.malchusDocument
		});
		yesodHost.append(malchusViewContract.shellRoot);
		yesodInteractionController.connect();
		yesodFullscreenController.connect();
		this.tiferesMountHandle = new TiferesPlayerShellMountHandle({
			shellRoot: malchusViewContract.shellRoot,
			interactionController: yesodInteractionController,
			fullscreenController: yesodFullscreenController,
			panelState: gevurahPanelState
		});
		return malchusViewContract.shellRoot;
	}

	/** @returns {boolean} True when the owned shell lifetime was disconnected and removed. */
	unmount() {
		const tiferesDidUnmount = this.tiferesMountHandle?.unmount() || false;
		if (tiferesDidUnmount) {
			this.tiferesMountHandle = null;
		}
		return tiferesDidUnmount;
	}
}
