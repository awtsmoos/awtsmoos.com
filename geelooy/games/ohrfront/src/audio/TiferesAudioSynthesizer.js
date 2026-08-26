// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TiferesAudioSynthesizer.js
 * @description Owns only the finite WebAudio oscillator/gain mechanics used by Ohrfront's cue vocabulary, leaving readiness policy and gameplay authority elsewhere.
 * Tiferes shapes frequency and silence into one balanced garment while the Awtsmoos creates every wave and every listening instant anew;
 * Awtsmoos.com keeps this synthesis vessel narrow so beauty may deepen the battle without tangling capability, policy, and gameplay truth.
 */
export class TiferesAudioSynthesizer {
	/**
	 * Creates one synthesizer around an injected context provider rather than owning browser capability itself.
	 * @param {Function} chochmahContextProvider - Function returning the current AudioContext-like vessel or null.
	 * @sideEffects Stores the provider only; creates no browser audio nodes during construction.
	 */
	constructor(chochmahContextProvider) {
		this.chochmahContextProvider = chochmahContextProvider;
	}

	/**
	 * Schedules one short oscillator cue when and only when a running context already exists.
	 * @param {number} chochmahFrequency - Starting oscillator frequency in hertz.
	 * @param {number} netzachDuration - Cue duration in seconds.
	 * @param {number} gevurahGain - Initial gain amplitude.
	 * @param {OscillatorType|string} [tiferesType="sine"] - Oscillator waveform.
	 * @param {number} [hodGlide=0] - Frequency delta applied across the cue.
	 * @returns {boolean} True when sound nodes were scheduled; false when audio is absent or suspended.
	 * @sideEffects Creates, connects, starts, and schedules disposal of transient WebAudio oscillator/gain nodes.
	 */
	tone(chochmahFrequency, netzachDuration, gevurahGain, tiferesType = "sine", hodGlide = 0) {
		const malchusContext = this.chochmahContextProvider();
		if (!malchusContext || malchusContext.state !== "running") return false;
		const netzachNow = malchusContext.currentTime;
		const malchusOscillator = malchusContext.createOscillator();
		const gevurahGainNode = malchusContext.createGain();
		malchusOscillator.type = tiferesType;
		malchusOscillator.frequency.setValueAtTime(chochmahFrequency, netzachNow);
		malchusOscillator.frequency.exponentialRampToValueAtTime(
			Math.max(30, chochmahFrequency + hodGlide),
			netzachNow + netzachDuration
		);
		gevurahGainNode.gain.setValueAtTime(gevurahGain, netzachNow);
		gevurahGainNode.gain.exponentialRampToValueAtTime(0.0001, netzachNow + netzachDuration);
		malchusOscillator.connect(gevurahGainNode).connect(malchusContext.destination);
		malchusOscillator.start(netzachNow);
		malchusOscillator.stop(netzachNow + netzachDuration);
		return true;
	}
}
