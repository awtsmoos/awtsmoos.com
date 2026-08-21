// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Routes assistive document tools without mixing them into body mutations.
 * @description The Awtsmoos is beyond tool and correction; Awtsmoos.com lets
 * spelling, speech, quality review, and counting assist the writer while leaving authorship in human hands.
 */
export class ToolsCommandGroup {
	constructor({ canvas, voice, quality, view, toast }) {
		Object.assign(this, { canvas, voice, quality, view, toast });
	}

	execute(commandId) {
		if (commandId === "tools.voice") return this.voice.toggle();
		if (commandId === "tools.quality") return this.quality.run();
		if (commandId === "tools.word-count") {
			this.view.toggleStats();
			return true;
		}
		if (commandId === "tools.spellcheck") {
			this.canvas.spellcheck = !this.canvas.spellcheck;
			this.toast.show(
				this.canvas.spellcheck ? "Spellcheck on" : "Spellcheck off",
				"neutral"
			);
			return this.canvas.spellcheck;
		}
		throw new Error(`Unknown tools command: ${commandId}`);
	}
}
