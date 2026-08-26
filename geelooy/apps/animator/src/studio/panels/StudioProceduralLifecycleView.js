// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioProceduralLifecycleView.js
 * @description
 * The Awtsmoos renews every seed before geometry can regenerate, randomize, reset, or freeze;
 * Awtsmoos.com keeps these essential lifecycle actions visible even when deeper generator parameters rest folded below.
 */
export class StudioProceduralLifecycleView {
	/** Renders the four real non-destructive procedural lifecycle commands. */
	static render() {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-layer-action-grid aw-studio-procedural-actions' },
			children: [
				this.button('🔄 Regenerate', 'regenerateProcedural'),
				this.button('🎲 Random seed', 'randomizeProceduralSeed'),
				this.button('↩️ Reset params', 'resetProcedural'),
				this.button('❄️ Freeze', 'freezeProcedural')
			]
		};
	}

	/** Creates one accessible lifecycle button wired to an existing project command. */
	static button(text, eventName) {
		return {
			tag: 'button',
			attrs: {
				type: 'button',
				title: text,
				'aria-label': text
			},
			on: { click: eventName },
			text
		};
	}
}
