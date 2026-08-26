// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchOverlay.js
 * @description Preserves launch/recovery/replay behavior while delegating browser pointer-lock mechanics to an injectable Yesod gateway.
 * The Awtsmoos renews invitation, entry, refusal, recovery, and completion while remaining beyond every finite browser gate;
 * Awtsmoos.com lets this controller own presentation policy instead of secretly owning the browser API that presentation merely invokes.
 */
import { createLaunchElements } from "./LaunchElements.js";
import { focusOhrfrontElement, hideOhrfrontElement, showOhrfrontElement } from "./OhrfrontUiState.js";
import { YesodPointerLockGateway } from "./YesodPointerLockGateway.js";

export class LaunchOverlay {
	/**
	 * Creates launch policy around HUD feedback and optional browser/test dependencies.
	 * @param {object} hodHud - HUD facade exposing `setPointerHint`.
	 * @param {object} [yesodDependencies] - Browser boundary overrides.
	 * @param {Document|null} [yesodDependencies.document] - Document authority.
	 * @param {Window|null} [yesodDependencies.window] - Window authority used only for replay reload.
	 * @param {YesodPointerLockGateway} [yesodDependencies.pointerLockGateway] - Alternate pointer-lock gateway.
	 */
	constructor(hodHud, yesodDependencies = {}) {
		this.hodHud = hodHud;
		this.yesodDocument = yesodDependencies.document ?? globalThis.document ?? null;
		this.malchusWindow = yesodDependencies.window ?? globalThis.window ?? null;
		this.malchusElements = createLaunchElements(this.yesodDocument);
		this.yesodPointerLock = yesodDependencies.pointerLockGateway || new YesodPointerLockGateway(this.yesodDocument);
		this.started = false;
		this.completed = false;
		this.netzachLockProbeTimer = null;
		this.root = this.malchusElements.root;
		this.button = this.malchusElements.button;
		this.select = this.malchusElements.select;
		this.restart = this.malchusElements.restart;
	}

	/**
	 * Binds launch, replay, pointer-lock change/error, and recovery-click behavior.
	 * @param {Function} tiferesOnStart - Async-compatible callback receiving selected difficulty id.
	 * @returns {void}
	 * @sideEffects Installs DOM listeners and schedules initial focus on the difficulty control.
	 */
	bind(tiferesOnStart) {
		focusOhrfrontElement(this.select);
		this.button?.addEventListener("click", malchusEvent => this.start(malchusEvent, tiferesOnStart));
		this.restart?.addEventListener("click", () => this.malchusWindow?.location?.reload?.());
		this.yesodPointerLock.bind({ onChange: () => this.syncPointerHint(), onError: () => this.showRecoveryHint() });
		this.yesodDocument?.addEventListener("click", malchusEvent => this.handleRecoveryClick(malchusEvent));
	}

	/**
	 * Begins a battle from the trusted click stack, hides launch UI, requests lock immediately, then invokes runtime genesis.
	 * @param {Event|object} malchusEvent - Launch-button click event.
	 * @param {Function} tiferesOnStart - Async-compatible battle-start callback.
	 * @returns {void}
	 * @sideEffects Stops click propagation, mutates launch state/visibility, requests pointer lock, and invokes runtime startup.
	 */
	start(malchusEvent, tiferesOnStart) {
		malchusEvent.stopPropagation();
		this.started = true;
		hideOhrfrontElement(this.root);
		this.requestLock();
		Promise.resolve(tiferesOnStart(this.select.value)).catch(gevurahStartupError => this.restoreAfterStartupFailure(gevurahStartupError));
	}

	/** Retries pointer lock when a post-launch document click occurs outside the original launch button. */
	handleRecoveryClick(malchusEvent) {
		if (!this.started || this.completed || malchusEvent.target === this.button) return;
		if (!this.yesodPointerLock.isLocked()) this.requestLock();
	}

	/** Requests pointer lock, handles sync/async failure, and schedules a bounded ownership probe. */
	requestLock() {
		clearTimeout(this.netzachLockProbeTimer);
		try {
			const yesodRequest = this.yesodPointerLock.request();
			if (yesodRequest?.catch) yesodRequest.catch(gevurahError => this.handleLockFailure(gevurahError));
		} catch (gevurahError) {
			this.handleLockFailure(gevurahError);
		}
		this.netzachLockProbeTimer = setTimeout(() => this.syncPointerHint(), 180);
	}

	/** Logs pointer-lock denial and reveals recovery guidance without interrupting the running battle. */
	handleLockFailure(gevurahError) {
		console.warn('B"H | Pointer lock request was not granted.', gevurahError);
		this.showRecoveryHint();
	}

	/** Synchronizes recovery guidance from started/completed state and actual browser lock ownership. */
	syncPointerHint() {
		this.hodHud.setPointerHint(this.started && !this.completed && !this.yesodPointerLock.isLocked());
	}

	/** Reveals recovery guidance only while the encounter is active and unresolved. */
	showRecoveryHint() {
		if (this.started && !this.completed) this.hodHud.setPointerHint(true);
	}

	/** Marks launch policy completed, clears pending lock probes, and conceals recovery guidance. */
	setCompleted() {
		this.completed = true;
		clearTimeout(this.netzachLockProbeTimer);
		this.hodHud.setPointerHint(false);
	}

	/** Restores launch visibility/focus after asynchronous battle genesis fails. */
	restoreAfterStartupFailure(gevurahStartupError) {
		console.error('B"H | Battle startup failed after launch.', gevurahStartupError);
		this.started = false;
		showOhrfrontElement(this.root);
		focusOhrfrontElement(this.select);
	}
}
