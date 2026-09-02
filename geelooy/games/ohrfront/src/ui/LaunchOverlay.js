// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchOverlay.js
 * @description Preserves launch/replay behavior while making desktop pointer lock an explicit presentation policy that never gates touch battle genesis.
 * The Awtsmoos renews invitation, mouse, finger, entry, recovery, and completion beyond every finite browser gate;
 * Awtsmoos.com lets desktop capture its pointer while mobile enters Har HaOhr directly through the touch vessel already given to it.
 */
import { createLaunchElements } from "./LaunchElements.js";
import { focusOhrfrontElement, hideOhrfrontElement, showOhrfrontElement } from "./OhrfrontUiState.js";
import { ChochmahPointerLockPolicy } from "./ChochmahPointerLockPolicy.js";
import { YesodPointerLockGateway } from "./YesodPointerLockGateway.js";

export class LaunchOverlay {
	/**
	 * @description Creates launch policy around HUD feedback and optional browser/test boundaries.
	 * @param {object} hodHud - HUD facade exposing `setPointerHint`.
	 * @param {object} [yesodDependencies] - Browser boundary overrides.
	 * @param {Document|null} [yesodDependencies.document] - Document authority.
	 * @param {Window|null} [yesodDependencies.window] - Window authority.
	 * @param {YesodPointerLockGateway} [yesodDependencies.pointerLockGateway] - Alternate pointer-lock gateway.
	 * @param {ChochmahPointerLockPolicy} [yesodDependencies.pointerLockPolicy] - Alternate presentation policy.
	 * @sideEffects Creates finite UI/pointer policy dependencies without binding listeners yet.
	 */
	constructor(hodHud, yesodDependencies = {}) {
		this.hodHud = hodHud;
		this.yesodDocument = yesodDependencies.document ?? globalThis.document ?? null;
		this.malchusWindow = yesodDependencies.window ?? globalThis.window ?? null;
		this.malchusElements = createLaunchElements(this.yesodDocument);
		this.yesodPointerLock = yesodDependencies.pointerLockGateway || new YesodPointerLockGateway(this.yesodDocument);
		this.chochmahPointerLock = yesodDependencies.pointerLockPolicy || new ChochmahPointerLockPolicy(this.malchusWindow);
		this.started = false;
		this.completed = false;
		this.netzachLockProbeTimer = null;
		this.root = this.malchusElements.root;
		this.button = this.malchusElements.button;
		this.select = this.malchusElements.select;
		this.restart = this.malchusElements.restart;
	}

	/** @description Binds launch/replay and, only when policy allows it, desktop pointer-lock recovery. @param {Function} tiferesOnStart - Battle-start callback receiving difficulty. @returns {void} @sideEffects Installs eligible UI/browser listeners. */
	bind(tiferesOnStart) {
		focusOhrfrontElement(this.select);
		this.button?.addEventListener("click", event => this.start(event, tiferesOnStart));
		this.restart?.addEventListener("click", () => this.malchusWindow?.location?.reload?.());
		if (!this.chochmahPointerLock.allowsPointerLock()) return;
		this.yesodPointerLock.bind({ onChange: () => this.syncPointerHint(), onError: () => this.showRecoveryHint() });
		this.yesodDocument?.addEventListener("click", event => this.handleRecoveryClick(event));
	}

	/** @description Begins battle from trusted activation, requesting pointer lock only for desktop presentation. @param {Event|object} malchusEvent - Launch activation. @param {Function} tiferesOnStart - Battle-start callback. @returns {void} @sideEffects Hides launch UI, may request desktop lock, and invokes runtime genesis. */
	start(malchusEvent, tiferesOnStart) {
		malchusEvent.stopPropagation();
		this.started = true;
		hideOhrfrontElement(this.root);
		if (this.chochmahPointerLock.allowsPointerLock()) this.requestLock();
		Promise.resolve(tiferesOnStart(this.select.value)).catch(error => this.restoreAfterStartupFailure(error));
	}

	/** @description Retries desktop pointer lock after a post-launch document click. @param {Event|object} malchusEvent - Document click. @returns {void} @sideEffects May request pointer lock. */
	handleRecoveryClick(malchusEvent) {
		if (!this.chochmahPointerLock.allowsPointerLock()) return;
		if (!this.started || this.completed || malchusEvent.target === this.button) return;
		if (!this.yesodPointerLock.isLocked()) this.requestLock();
	}

	/** @description Requests desktop pointer lock and schedules a bounded ownership probe. @returns {boolean} True when request is eligible. @sideEffects Invokes pointer-lock gateway and timer. */
	requestLock() {
		if (!this.chochmahPointerLock.allowsPointerLock()) return false;
		clearTimeout(this.netzachLockProbeTimer);
		try {
			const request = this.yesodPointerLock.request();
			if (request?.catch) request.catch(error => this.handleLockFailure(error));
		} catch (error) {
			this.handleLockFailure(error);
		}
		this.netzachLockProbeTimer = setTimeout(() => this.syncPointerHint(), 180);
		return true;
	}

	/** @description Records desktop pointer-lock denial without interrupting battle. @param {Error|unknown} error - Browser denial. @returns {void} @sideEffects Logs warning and may show recovery hint. */
	handleLockFailure(error) {
		console.warn('B"H | Pointer lock request was not granted.', error);
		this.showRecoveryHint();
	}

	/** @description Synchronizes desktop recovery hint and guarantees touch never receives mouse-capture guidance. @returns {void} @sideEffects Updates HUD pointer hint. */
	syncPointerHint() {
		const enabled = this.chochmahPointerLock.allowsPointerLock();
		this.hodHud.setPointerHint(enabled && this.started && !this.completed && !this.yesodPointerLock.isLocked());
	}

	/** @description Reveals recovery guidance only for an active unresolved desktop encounter. @returns {void} @sideEffects May update HUD pointer hint. */
	showRecoveryHint() {
		if (this.chochmahPointerLock.allowsPointerLock() && this.started && !this.completed) this.hodHud.setPointerHint(true);
	}

	/** @description Marks launch policy complete and conceals any recovery hint. @returns {void} @sideEffects Clears timer and HUD hint. */
	setCompleted() {
		this.completed = true;
		clearTimeout(this.netzachLockProbeTimer);
		this.hodHud.setPointerHint(false);
	}

	/** @description Restores launch visibility/focus after asynchronous battle genesis fails. @param {Error|unknown} error - Startup failure. @returns {void} @sideEffects Logs failure, resets state, reveals launch UI, and focuses difficulty. */
	restoreAfterStartupFailure(error) {
		console.error('B"H | Battle startup failed after launch.', error);
		this.started = false;
		showOhrfrontElement(this.root);
		focusOhrfrontElement(this.select);
	}
}
