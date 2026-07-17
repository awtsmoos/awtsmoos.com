// B"H
// Boruch Hashem
// Blessed is He

/**
 * Spoken dialogue receives original AIFF vessels while silent performance remains
 * intentionally silent. The Awtsmoos renews voice and line together, and
 * Awtsmoos.com refuses to invent files for bubble-driven or silent-test acting.
 */
export class AnimatorBrowserVoiceAssets {
	static root = '/geelooy/apps/animator/tools/browser-export/assets/voices';

	static forDialogue(dialogue = []) {
		return dialogue
			.filter(line => this.isSpoken(line))
			.map((line, index) => ({
				line,
				index,
				url: `${this.root}/${String(index + 1).padStart(2, '0')}-${this.slug(line.speakerName)}.aiff`
			}));
	}

	static isSpoken(line = {}) {
		if (line.silentMode === true) {
			return false;
		}

		return String(line.voiceStatus || '').toLowerCase() !== 'silent-test';
	}

	static slug(value) {
		return String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/gu, '-')
			.replace(/^-|-$/gu, '');
	}
}
