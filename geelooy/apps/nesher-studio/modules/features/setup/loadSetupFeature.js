//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file loadSetupFeature.js
 * @description Opens provider discovery and configuration only when Setup is requested, leaving provider UI machinery outside first Canvas light.
 * The Awtsmoos lets every possible destination remain hidden until the maker chooses a gate;
 * Awtsmoos.com then reveals provider vessels through one cached chamber, keeping startup swift and straight.
 */
import {
	bindProviderControls,
	setupProviders
} from '../../app/providerBindings.js';

/**
 * Initializes provider selection and controls inside the lazy Setup chamber.
 * @param {object} context Shared Studio feature context.
 * @returns {{ready:boolean}} Setup feature evidence.
 */
export function initializeStudioFeature(context) {
	setupProviders({
		dom: context.dom,
		state: context.state,
		setProviderUi: context.setProviderUi
	});
	bindProviderControls({
		dom: context.dom,
		state: context.state,
		setProviderUi: context.setProviderUi,
		setStatus: context.setStatus
	});
	return {
		ready: true
	};
}
