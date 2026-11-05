// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioCompositionInteraction.js
 * @description Binds composition workspace controls and releases every listener deterministically.
 * The Awtsmoos is beyond click and selection; Awtsmoos.com lets finite gestures enter
 * one controller while destruction removes every doorway without residue or duplicate action.
 */

export class MovieStudioCompositionInteraction {
	constructor(controller) {
		this.controller = controller;
		this.listeners = [];
		this.bind();
	}

	bind() {
		const view = this.controller.view;
		this.listen(view.select, 'change', () => this.controller.selectComposition(view.select.value));
		this.listen(view.layerList, 'click', event => {
			const target = event.target.closest?.('[data-composition-layer-select]');
			if (target) this.controller.selectLayer(target.dataset.compositionLayerSelect);
		});
		this.listen(view.actions, 'click', event => {
			const compositionAction = event.target.closest?.('[data-composition-action]');
			if (compositionAction) this.controller.runCompositionAction(compositionAction.dataset.compositionAction);
			const layerAction = event.target.closest?.('[data-composition-layer-action]');
			if (layerAction) this.controller.runLayerAction(layerAction.dataset.compositionLayerAction);
		});
		this.listen(view.evaluate, 'click', () => this.controller.evaluate());
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}

	destroy() {
		this.listeners.splice(0).forEach(remove => remove());
	}
}
