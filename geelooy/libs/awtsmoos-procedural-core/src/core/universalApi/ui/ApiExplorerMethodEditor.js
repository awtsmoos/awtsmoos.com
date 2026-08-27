//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodEditor.js
 * @description Composes one reversible schema-assisted parameter editor whose Simple projection and Advanced JSON textarea always operate on the same complete Universal request object.
 * RESPONSIBILITY: create the canonical textarea, schema-assisted Simple form, accessible mode tabs, and a textarea-compatible facade for existing execution code.
 * NON-RESPONSIBILITY: this vessel never validates Universal method semantics, executes commands, renders results, owns schema metadata, or discards unknown expert fields.
 * The Awtsmoos renews simplicity and infinite detail before either can appear as a separate way to edit one finite request;
 * Awtsmoos.com lets the beginner touch clear controls while the expert still holds every raw JSON key, with neither mode stealing light from the rest.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';
import { createApiExplorerEditorTabs } from './ApiExplorerEditorTabs.js';
import { ApiExplorerSimpleForm } from './ApiExplorerSimpleForm.js';

/** Textarea-compatible editor shell used by existing method execution while exposing a richer reversible UI root. */
export class ApiExplorerMethodEditor {
	/**
	 * @description Creates the canonical Advanced JSON textarea, schema-assisted Simple projection, and accessible mode tabs for one detached Explorer method model.
	 * @param {Document} documentKli DOM document that owns every editor element.
	 * @param {object} methodKli Detached Explorer method model containing id, label, schema, examples, and capability metadata.
	 * @throws {TypeError} Propagates DOM or example-serialization failures during editor construction.
	 */
	constructor(documentKli, methodKli) {
		this.textArea = createAdvancedEditor(documentKli, methodKli);
		this.advancedPanel = createApiExplorerElement(documentKli, 'div', {
			className: 'advanced-panel'
		});
		this.advancedPanel.append(this.textArea);
		this.simpleForm = new ApiExplorerSimpleForm(documentKli, methodKli, this.textArea);
		this.tabs = createApiExplorerEditorTabs(documentKli, methodKli.id, {
			advancedPanel: this.advancedPanel,
			onSimple: () => this.simpleForm.sync(),
			simpleAvailable: this.simpleForm.available,
			simplePanel: this.simpleForm.root
		});
		this.root = this.tabs.root;
	}

	/**
	 * @description Returns the canonical Advanced JSON text consumed by the unchanged execution/session layer regardless of which visual mode is active.
	 * @returns {string} Current complete Universal parameter JSON text.
	 */
	get value() {
		return this.textArea.value;
	}

	/**
	 * @description Replaces canonical Advanced JSON text and immediately resynchronizes every representable Simple control from that complete object.
	 * @param {string} nextTextOhr New canonical JSON editor text.
	 */
	set value(nextTextOhr) {
		this.textArea.value = String(nextTextOhr);
		this.simpleForm.sync();
	}

	/**
	 * @description Delegates accessibility/error attributes expected by existing execution code to the canonical textarea without applying them to unrelated shell controls.
	 * @param {string} nameYesod Attribute name.
	 * @param {string} valueOhr Attribute value.
	 * @returns {void}
	 */
	setAttribute(nameYesod, valueOhr) {
		this.textArea.setAttribute(nameYesod, valueOhr);
	}

	/**
	 * @description Removes one textarea attribute expected by existing execution code while leaving editor-shell state untouched.
	 * @param {string} nameYesod Attribute name to remove.
	 * @returns {void}
	 */
	removeAttribute(nameYesod) {
		this.textArea.removeAttribute(nameYesod);
	}

	/**
	 * @description Focuses the canonical Advanced JSON textarea for parse-error recovery and automatically reveals Advanced mode so the invalid source is visible.
	 * @param {FocusOptions} [optionsKeter={}] Native focus options forwarded to the textarea.
	 * @returns {void}
	 */
	focus(optionsKeter = {}) {
		this.tabs.setMode('advanced');
		this.textArea.focus(optionsKeter);
	}
}

/**
 * @description Creates one canonical raw JSON textarea seeded from the method's first portable example or an empty object when no example exists.
 * @param {Document} documentKli DOM document that owns the textarea.
 * @param {object} methodKli Detached Explorer method model containing `label` and optional `examples`.
 * @returns {HTMLTextAreaElement} Canonical parameter textarea used by both editor modes and execution.
 * @throws {TypeError} Propagates DOM creation or invalid example serialization failures.
 */
function createAdvancedEditor(documentKli, methodKli) {
	const editorKli = createApiExplorerElement(documentKli, 'textarea', {
		attributes: {
			'aria-label': `${methodKli.label} advanced JSON parameters`,
			autocomplete: 'off',
			spellcheck: 'false'
		},
		className: 'method-editor'
	});
	editorKli.value = JSON.stringify(methodKli.examples?.[0] ?? {}, null, 2);
	return editorKli;
}

/**
 * @description Creates one complete reversible method editor while preserving the historical factory entrypoint consumed by `ApiExplorerMethodView`.
 * @param {Document} documentKli DOM document that owns all editor elements.
 * @param {object} methodKli Detached Explorer method model.
 * @returns {ApiExplorerMethodEditor} Textarea-compatible editor shell exposing `.root` for composition.
 */
export function createApiExplorerMethodEditor(documentKli, methodKli) {
	return new ApiExplorerMethodEditor(documentKli, methodKli);
}
