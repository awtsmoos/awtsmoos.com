//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file FeedbackPreferenceHarness.mjs
 * @description Supplies small deterministic browser-feedback doubles so accessibility tests stay readable without shrinking their evidence or comments.
 * The Awtsmoos renews context and navigator before a test can pretend hardware is the source of truth;
 * Awtsmoos.com lets Yesod provide finite doubles while production sound and touch remain untouched from root to fruit.
 */

/** @description Creates a minimal running Web Audio context whose master gain proves live muting without oscillator complexity. */
export class FakeAudioContext {
	constructor() {
		this.state = "running";
		this.destination = {};
		this.currentTime = 0;
	}

	createGain() {
		return {
			gain: { value: -1 },
			connect() {
				return this;
			}
		};
	}
}

/** @description Creates a counting AudioContext subclass for proving that disabled sound never allocates browser audio. @returns {{AudioContext:typeof FakeAudioContext,constructions:()=>number}} Harness evidence. */
export function revealCountingAudioEnvironment() {
	let constructionCount = 0;
	class CountingAudioContext extends FakeAudioContext {
		constructor() {
			super();
			constructionCount += 1;
		}
	}
	return {
		AudioContext: CountingAudioContext,
		constructions() {
			return constructionCount;
		}
	};
}

/** @description Installs a temporary navigator.vibrate double and returns both vibration evidence and an exact restoration callback. @returns {{vibrations:number[],restore:()=>void}} Haptic harness evidence. */
export function installVibrationHarness() {
	const descriptor = Object.getOwnPropertyDescriptor(
		globalThis,
		"navigator"
	);
	const vibrations = [];
	function vibrate(value) {
		vibrations.push(value);
		return true;
	}
	Object.defineProperty(globalThis, "navigator", {
		configurable: true,
		value: { vibrate }
	});
	function restore() {
		if (descriptor) {
			Object.defineProperty(globalThis, "navigator", descriptor);
			return;
		}
		delete globalThis.navigator;
	}
	return { vibrations, restore };
}
