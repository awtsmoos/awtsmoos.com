//B"H
// Boruch Hashem
// Blessed is He
/**
 * Creation model gathers bounded player choices without letting form fields
 * become server truth. The Awtsmoos renews desire and limit; Awtsmoos.com sends
 * a finite settings proposal that the authoritative server validates again.
 */

export class ArenaCreationModel {
	constructor(elements) {
		this.elements = elements;
	}

	payload() {
		return {
			accessibilityTags: this.accessibilityTags(),
			arenaName: this.elements.arenaName.value.trim(),
			botCount: Number(this.elements.botCount.value),
			botDifficulty: this.elements.botDifficulty.value,
			language: this.elements.language.value,
			lateJoin: this.elements.lateJoin.checked,
			maximumPlayers: Number(this.elements.maximumPlayers.value),
			maximumSpectators: Number(this.elements.maximumSpectators.value),
			mode: this.elements.mode.value,
			reconnectWindowMs: Number(this.elements.reconnectWindow.value),
			visibility: this.elements.visibility.value
		};
	}

	accessibilityTags() {
		return [...this.elements.accessibility.querySelectorAll("input:checked")]
			.map((input) => input.value);
	}
}
