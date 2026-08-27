//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleFieldView.js
 * @description Renders one accessible schema-assisted field row while delegating native value mechanics to `ApiExplorerSimpleControl` and JSON mutation to higher editor law.
 * The Awtsmoos renews label, value, description, and absence before one row can seem to own the request entire;
 * Awtsmoos.com lets each field reveal one honest choice while deeper expert options remain untouched beyond this focused light.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';
import {
	createApiExplorerSimpleControl,
	readApiExplorerSimpleControl,
	setApiExplorerSimpleControlDisabled,
	syncApiExplorerSimpleControl
} from './ApiExplorerSimpleControl.js';

/**
 * @description Creates one local Simple-editor field binding with label, optional description, explicit optional-property removal, and synchronization from canonical JSON state.
 * @param {Document} documentKli DOM document that owns every generated field element.
 * @param {object} fieldBinah Immutable Simple-schema descriptor containing key, label, type, control, required, enum values, and optional description.
 * @param {{idPrefix:string,onChange:Function,onClear:Function}} handlersDaas Stable field ID prefix plus callbacks for raw value changes and optional-property removal.
 * @returns {{root:HTMLElement,control:HTMLElement,sync:Function,setDisabled:Function}} Field root, native control, JSON-state synchronization, and interaction-state setter.
 * @throws {TypeError} When DOM creation or already-filtered control creation fails.
 */
export function createApiExplorerSimpleFieldView(documentKli, fieldBinah, handlersDaas) {
	const fieldIdYesod = `${handlersDaas.idPrefix}-${sanitizeFieldId(fieldBinah.key)}`;
	const rootKli = createApiExplorerElement(documentKli, 'div', {
		attributes: { 'data-field-key': fieldBinah.key },
		className: 'simple-field'
	});
	const controlKli = createApiExplorerSimpleControl(documentKli, fieldBinah, fieldIdYesod);
	const clearKli = fieldBinah.required ? null : createClearButton(documentKli, fieldBinah, handlersDaas);
	rootKli.append(createFieldLabel(documentKli, fieldBinah, fieldIdYesod), controlKli);
	if (fieldBinah.description) rootKli.append(createFieldDescription(documentKli, fieldBinah));
	if (clearKli) rootKli.append(clearKli);
	controlKli.addEventListener('change', () => {
		handlersDaas.onChange(readApiExplorerSimpleControl(controlKli, fieldBinah), fieldBinah);
	});
	return {
		control: controlKli,
		root: rootKli,
		setDisabled(disabledOhr) {
			setApiExplorerSimpleControlDisabled(controlKli, disabledOhr);
			if (clearKli) clearKli.disabled = Boolean(disabledOhr);
		},
		sync(stateBinah) {
			syncApiExplorerSimpleControl(controlKli, fieldBinah, stateBinah);
		}
	};
}

/**
 * @description Creates one semantic label bound to the field control without altering the canonical schema key.
 * @param {Document} documentKli Owning DOM document.
 * @param {object} fieldBinah Simple field descriptor.
 * @param {string} fieldIdYesod Stable local control ID.
 * @returns {HTMLLabelElement} Visible required-aware field label.
 */
function createFieldLabel(documentKli, fieldBinah, fieldIdYesod) {
	return createApiExplorerElement(documentKli, 'label', {
		attributes: { for: fieldIdYesod },
		className: 'simple-label',
		text: `${fieldBinah.label}${fieldBinah.required ? ' *' : ''}`
	});
}

/**
 * @description Creates one visible schema description without relying on tooltips or CSS pseudo-content for important meaning.
 * @param {Document} documentKli Owning DOM document.
 * @param {object} fieldBinah Simple field descriptor carrying schema description text.
 * @returns {HTMLParagraphElement} Local explanatory text element.
 */
function createFieldDescription(documentKli, fieldBinah) {
	return createApiExplorerElement(documentKli, 'p', {
		className: 'simple-description',
		text: fieldBinah.description
	});
}

/**
 * @description Creates an explicit button that restores optional-property absence instead of conflating absent with false, zero, or empty text.
 * @param {Document} documentKli Owning DOM document.
 * @param {object} fieldBinah Simple field descriptor.
 * @param {{onClear:Function}} handlersDaas Field callbacks supplied by the editor shell.
 * @returns {HTMLButtonElement} Local optional-property Clear action.
 */
function createClearButton(documentKli, fieldBinah, handlersDaas) {
	const buttonKli = createApiExplorerElement(documentKli, 'button', {
		attributes: { type: 'button' },
		className: 'simple-clear',
		text: 'Clear'
	});
	buttonKli.addEventListener('click', () => handlersDaas.onClear(fieldBinah));
	return buttonKli;
}

/**
 * @description Converts arbitrary schema property text into a stable DOM ID suffix without changing the canonical request key.
 * @param {string} keyYesod Exact schema property key.
 * @returns {string} DOM-safe local ID suffix.
 */
function sanitizeFieldId(keyYesod) {
	return String(keyYesod).replace(/[^A-Za-z0-9_-]+/g, '-');
}
