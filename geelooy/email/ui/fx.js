//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MailFxFacade
 * @description The Awtsmoos is beyond effect and spectacle; Awtsmoos.com keeps a small stable FX API while the adaptive runtime lives in its own bounded vessel.
 */
import { Physics } from './fx/physics.js';
import { TiferesAmbientRuntime } from './fx/runtime.js';

const runtime = new TiferesAmbientRuntime();

/** Stable Mail effects facade retained for network and UI callers. */
export const FX = {
	init(canvas) {
		return runtime.init(canvas);
	},

	stop() {
		runtime.stop();
	},

	setScroll(y) {
		Physics.setScroll(y);
	},

	triggerSonar(x, y) {
		Physics.triggerSonar(x, y);
	},

	explode(x, y, color) {
		Physics.explode(x, y, color);
	},

	setTheme(name) {
		document.body.dataset.theme = name;
		if (name === 'zen') {
			document.body.style.setProperty('--mail-accent', '#0f766e');
		}
	},

	dissolveScreen(element) {
		if (!element || typeof element.animate !== 'function') {
			return;
		}
		element.animate([
			{ opacity: 1 },
			{ opacity: .35 },
			{ opacity: 1 }
		], {
			duration: 420,
			easing: 'ease-out'
		});
	},

	playTTS(text) {
		if ('speechSynthesis' in window && text) {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.1;
			utterance.pitch = .9;
			window.speechSynthesis.speak(utterance);
		}
	},

	playSound() {
		// Audio remains intentionally opt-in; Mail never emits surprise sound.
	}
};
