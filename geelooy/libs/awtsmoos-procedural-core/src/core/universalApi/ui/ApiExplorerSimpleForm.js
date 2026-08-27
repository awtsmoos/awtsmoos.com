//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleForm.js
 * @description Synchronizes safely representable Simple controls over one canonical Advanced JSON textarea while field collection and status explanation remain delegated to focused modules.
 * The Awtsmoos renews simple form and hidden depth before one mode can claim ownership of the request;
 * Awtsmoos.com lets every basic field mirror the complete JSON vessel, while unfamiliar advanced keys remain preserved and authoritative beneath the same text.
 */
import {
	removeApiExplorerEditorProperty,
	updateApiExplorerEditorProperty
} from './ApiExplorerEditorPatch.js';
import {
	coerceApiExplorerSimpleValue,
	parseApiExplorerEditorObject
} from './ApiExplorerEditorValue.js';
import { createApiExplorerSimpleFieldCollection } from './ApiExplorerSimpleFieldCollection.js';
import { createApiExplorerSimpleSchema } from './ApiExplorerSimpleSchema.js';
import {
	createApiExplorerSimpleStatus,
	reflectApiExplorerSimpleStatus
} from './ApiExplorerSimpleStatus.js';
import { createApiExplorerElement } from './ApiExplorerDom.js';

/** Schema-assisted Simple form bound reversibly to one canonical JSON textarea. */
export class ApiExplorerSimpleForm {
	/**
	 * @description Builds the local Simple panel from method schema metadata and immediately synchronizes supported controls from the supplied canonical textarea without changing its value.
	 * @param {Document} documentKli DOM document that owns generated form elements.
	 * @param {object} methodKli Detached Explorer method model containing `id` and `paramsSchema`.
	 * @param {HTMLTextAreaElement} editorKli Canonical Advanced JSON textarea whose full object always remains authoritative.
	 */
	constructor(documentKli, methodKli, editorKli) {
		this.editor = editorKli;
		this.schema = createApiExplorerSimpleSchema(methodKli.paramsSchema || {});
		this.root = createApiExplorerElement(documentKli, 'div', {
			attributes: { role: 'tabpanel' },
			className: 'simple-panel'
		});
		this.status = createApiExplorerSimpleStatus(documentKli);
		this.root.append(this.status);
		this.bindings = createApiExplorerSimpleFieldCollection(
			documentKli,
			this.root,
			methodKli.id,
			this.schema.fields,
			{
				onChange: (fieldBinah, rawOhr) => this.applyField(fieldBinah, rawOhr),
				onClear: (fieldBinah) => this.clearField(fieldBinah)
			}
		);
		this.editor.addEventListener('input', () => this.sync());
		this.sync();
	}

	/**
	 * @description Returns whether at least one parameter property can be represented safely by Simple mode; Advanced JSON remains available regardless.
	 * @returns {boolean} True when at least one supported field descriptor exists.
	 */
	get available() {
		return this.schema.fields.length > 0;
	}

	/**
	 * @description Synchronizes every Simple field from current canonical JSON, disabling Simple interaction while Advanced JSON is invalid rather than overwriting stale expert work.
	 * @returns {boolean} True when the canonical JSON parsed as an object and synchronization completed.
	 */
	sync() {
		try {
			const paramsBinah = parseApiExplorerEditorObject(this.editor.value);
			for (const bindingYesod of this.bindings) {
				bindingYesod.view.sync({
					found: Object.hasOwn(paramsBinah, bindingYesod.field.key),
					value: paramsBinah[bindingYesod.field.key]
				});
				bindingYesod.view.setDisabled(false);
			}
			reflectApiExplorerSimpleStatus(this.root, this.status, this.schema, 'ready');
			return true;
		} catch {
			for (const bindingYesod of this.bindings) bindingYesod.view.setDisabled(true);
			reflectApiExplorerSimpleStatus(this.root, this.status, this.schema, 'invalid');
			return false;
		}
	}

	/**
	 * @description Applies one supported Simple field value by patching only its canonical top-level JSON property, then resynchronizes every projected control from the resulting complete object.
	 * @param {object} fieldBinah Immutable Simple field descriptor.
	 * @param {unknown} rawOhr Raw native control value or explicit undefined optional enum state.
	 * @returns {void} Mutates only canonical textarea text and synchronized Simple control presentation.
	 */
	applyField(fieldBinah, rawOhr) {
		if (rawOhr === undefined && !fieldBinah.required) return this.clearField(fieldBinah);
		const valueOhr = coerceApiExplorerSimpleValue(fieldBinah, rawOhr);
		this.editor.value = updateApiExplorerEditorProperty(this.editor.value, fieldBinah.key, valueOhr);
		this.sync();
	}

	/**
	 * @description Removes one optional property from canonical JSON without touching unrelated expert fields, then resynchronizes the Simple projection.
	 * @param {object} fieldBinah Immutable optional field descriptor.
	 * @returns {void} Mutates only canonical textarea text and synchronized Simple controls.
	 */
	clearField(fieldBinah) {
		this.editor.value = removeApiExplorerEditorProperty(this.editor.value, fieldBinah.key);
		this.sync();
	}
}
