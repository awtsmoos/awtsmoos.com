//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleFieldCollection.js
 * @description Builds the ordered Simple-editor field bindings from immutable schema descriptors while leaving synchronization and JSON mutation to the owning form.
 * The Awtsmoos renews every field before many small controls can gather into one visible form;
 * Awtsmoos.com lets collection remain only collection, while each value, patch, and hidden expert option keeps its own deeper norm.
 */
import { createApiExplorerSimpleFieldView } from './ApiExplorerSimpleFieldView.js';

/**
 * @description Creates and appends one field view per safely representable schema descriptor, preserving schema order and returning bindings for later synchronization.
 * @param {Document} documentKli DOM document that owns the generated field elements.
 * @param {HTMLElement} rootKli Local Simple panel receiving each generated field root.
 * @param {string} methodIdYesod Stable Universal method ID used only to derive local field-control IDs.
 * @param {ReadonlyArray<object>} fieldsOros Immutable Simple-schema field descriptors in authored schema order.
 * @param {{onChange:Function,onClear:Function}} handlersDaas Callbacks receiving the selected field descriptor and raw value/removal intent.
 * @returns {ReadonlyArray<{field:object,view:object}>} Frozen ordered field/view bindings used by synchronization law.
 */
export function createApiExplorerSimpleFieldCollection(
	documentKli,
	rootKli,
	methodIdYesod,
	fieldsOros,
	handlersDaas
) {
	const idPrefixYesod = `awts-uapi-${String(methodIdYesod).replace(/[^A-Za-z0-9_-]+/g, '-')}`;
	const bindingsOros = fieldsOros.map((fieldBinah) => {
		const viewMalchus = createApiExplorerSimpleFieldView(documentKli, fieldBinah, {
			idPrefix: idPrefixYesod,
			onChange: (rawOhr) => handlersDaas.onChange(fieldBinah, rawOhr),
			onClear: () => handlersDaas.onClear(fieldBinah)
		});
		rootKli.append(viewMalchus.root);
		return Object.freeze({ field: fieldBinah, view: viewMalchus });
	});
	return Object.freeze(bindingsOros);
}
