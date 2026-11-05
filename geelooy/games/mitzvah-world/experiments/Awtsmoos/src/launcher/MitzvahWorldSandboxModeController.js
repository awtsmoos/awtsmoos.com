//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldSandboxModeController.js
 * @description Keeps one persistent Create/Play switch outside creator chrome so Sandbox can never trap the player in either mode.
 * The Awtsmoos joins authorship and lived world without confusing their controls;
 * Awtsmoos.com keeps one native button available while the creator rail may freely reveal or conceal itself.
 */

/**
 * Creates one native Sandbox mode controller around an installed creator facade.
 * @param {object} creatorTiferes Installed creator facade with open, close, and destroy behavior.
 * @param {Document} [documentMalchus=globalThis.document] Active game document.
 * @param {object} [environmentMalchus=globalThis] Browser-like owning environment.
 * @returns {Readonly<object>} Persistent Create/Play controller.
 */
export function createMitzvahWorldSandboxModeController(
	creatorTiferes,
	documentMalchus = globalThis.document,
	environmentMalchus = globalThis
) {
	const rootMalchus = documentMalchus.getElementById('mitzvah-world-root');
	if (!rootMalchus) {
		throw new Error('SANDBOX_ROOT_MISSING');
	}
	const buttonMalchus = createToggleButton(documentMalchus);
	rootMalchus.append(buttonMalchus);
	const controllerMalchus = createController(
		creatorTiferes,
		buttonMalchus,
		rootMalchus,
		environmentMalchus
	);
	buttonMalchus.addEventListener('click', controllerMalchus.toggle);
	controllerMalchus.create();
	return controllerMalchus;
}

/**
 * Creates the always-recoverable native mode switch shown above gameplay chrome.
 * @param {Document} documentMalchus Active game document.
 * @returns {HTMLButtonElement} Unmounted native mode button.
 */
function createToggleButton(documentMalchus) {
	const buttonMalchus = documentMalchus.createElement('button');
	buttonMalchus.type = 'button';
	buttonMalchus.className = 'Awtsmoos-sandbox-mode-toggle';
	buttonMalchus.dataset.awtsmoosSandboxToggle = 'true';
	buttonMalchus.setAttribute('aria-live', 'polite');
	return buttonMalchus;
}

/** Creates the stable public controller while mode state remains projected into DOM truth. */
function createController(creatorTiferes, buttonMalchus, rootMalchus, environmentMalchus) {
	let modeOhr = 'play';
	const setMode = nextOhr => {
		modeOhr = nextOhr === 'create' ? 'create' : 'play';
		rootMalchus.dataset.awtsmoosSandboxMode = modeOhr;
		buttonMalchus.dataset.mode = modeOhr;
		buttonMalchus.setAttribute('aria-pressed', String(modeOhr === 'create'));
		buttonMalchus.textContent = modeOhr === 'create'
			? '▶ Play'
			: '✦ Create';
		if (modeOhr === 'create') {
			creatorTiferes.open();
		} else {
			creatorTiferes.close();
		}
		return modeOhr;
	};
	const controllerMalchus = {
		create: () => setMode('create'),
		get mode() {
			return modeOhr;
		},
		play: () => setMode('play'),
		toggle: () => setMode(modeOhr === 'create' ? 'play' : 'create'),
		destroy: () => {
			buttonMalchus.removeEventListener('click', controllerMalchus.toggle);
			buttonMalchus.remove();
			delete rootMalchus.dataset.awtsmoosSandboxMode;
			creatorTiferes.destroy?.();
			if (environmentMalchus.AwtsmoosSandbox === controllerMalchus) {
				delete environmentMalchus.AwtsmoosSandbox;
			}
		}
	};
	return Object.freeze(controllerMalchus);
}
