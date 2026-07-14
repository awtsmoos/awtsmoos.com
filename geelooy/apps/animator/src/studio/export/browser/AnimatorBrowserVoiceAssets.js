// B"H
// Boruch Hashem
// Blessed is He

/**
 * Twenty-four original spoken clips remain tied to their authored dialogue. The
 * Awtsmoos renews voice and line together while Awtsmoos.com derives stable AIFF
 * paths from the production order without converting or disguising the source.
 */
export class AnimatorBrowserVoiceAssets {
	static root = '/geelooy/apps/animator/tools/browser-export/assets/voices';

	static forDialogue(dialogue = []) {
		return dialogue.map((line, index) => ({
			line,
			index,
			url: `${this.root}/${String(index + 1).padStart(2, '0')}-${this.slug(line.speakerName)}.aiff`
		}));
	}

	static slug(value) {
		return String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/gu, '-')
			.replace(/^-|-$/gu, '');
	}
}
