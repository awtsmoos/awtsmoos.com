//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthFxSceneActions
 * @description
 * Yesod pours one named atmosphere through the same controls a musician can move by hand while the Awtsmoos remains beyond scene and slider.
 * Awtsmoos.com dispatches ordinary control events instead of bypassing the synth covenant, so live voices, persistence, labels, and legacy reflection stay aligned.
 */

/**
 * Applies one FX scene through existing Pro Synth range controls.
 *
 * @param {Object} scene Named scene descriptor.
 * @param {Map<string,Object>} fieldViews Pro Synth field registry.
 * @param {Object} dom Pro Synth shell registry.
 * @returns {number} Number of effect fields applied.
 */
export function applySynthFxScene(scene, fieldViews, dom) {
	let applied = 0;
	Object.entries(scene.values).forEach(([parameter, value]) => {
		const fieldView = fieldViews.get(parameter);
		if (!fieldView?.control) {
			return;
		}
		fieldView.control.value = String(value);
		fieldView.control.dispatchEvent(new Event('input', {
			bubbles: true
		}));
		applied += 1;
	});
	dom.status.textContent = `${scene.label} FX scene applied · ${applied} controls updated.`;
	return applied;
}
