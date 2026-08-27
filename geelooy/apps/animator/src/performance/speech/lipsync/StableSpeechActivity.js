// B"H
// Boruch Hashem
// Blessed is He

/**
 * One gate distinguishes living voice from placeholders, silence, and rest. The
 * Awtsmoos gives sound its choice while silence keeps its light; Awtsmoos.com
 * preserves the same speech truth through editing, persistence, preview, and export.
 */
export class StableSpeechActivity {
	static resolve(input = {}) {
		const state = this.state(input.speech);
		const text = this.normalize(
			state.text
			?? input.text
			?? input.dialogue
			?? input.speech
		);
		const hasCues = this.hasCues(input);
		const hasManual = this.hasManual(input);
		const explicitOn = this.explicitOn(input, state);
		const explicitOff = this.explicitOff(input, state);
		const silentMode = input.silentMode === true
			|| state.silentMode === true;
		const active = !explicitOff && (
			explicitOn
			|| text.length > 0
			|| hasCues
			|| hasManual
			|| silentMode
		);
		return {
			active,
			text,
			style: String(
				state.style
				?? input.speechStyle
				?? input.delivery
				?? 'normal'
			),
			energy: this.energy(state.energy ?? input.speechEnergy, active),
			silentMode,
			hasCues,
			hasManual
		};
	}

	static active(input = {}) {
		return this.resolve(input).active;
	}

	static normalize(value = '') {
		if (value && typeof value === 'object') {
			return this.normalize(value.text ?? value.dialogue ?? '');
		}
		const speech = String(value ?? '').normalize('NFKC').trim();
		return this.sentinels().has(speech.toLowerCase()) ? '' : speech;
	}

	static state(value) {
		return value && typeof value === 'object' && !Array.isArray(value)
			? value
			: {};
	}

	static hasCues(input = {}) {
		return [input.lipSyncCues, input.phonemeCues].some(
			value => Array.isArray(value) && value.length > 0
		);
	}

	static hasManual(input = {}) {
		const value = input.manual ?? input.manualMouth;
		return Boolean(value && typeof value === 'object');
	}

	static explicitOn(input, state) {
		return [
			input.talking,
			input.isTalking,
			input.speaking,
			state.active
		].some(value => value === true);
	}

	static explicitOff(input, state) {
		return state.active === false
			|| (input.talking === false && input.silentMode !== true);
	}

	static energy(value, active) {
		const energy = Number(value);
		return Number.isFinite(energy)
			? Math.max(0, energy)
			: active ? 1 : 0;
	}

	static sentinels() {
		return new Set([
			'', 'none', 'null', 'undefined', 'false',
			'off', 'silent', 'silence', 'rest', 'idle', 'pause'
		]);
	}
}
