//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerSimpleControl.js
 * @description Owns native primitive/enum control creation, reading, and canonical-value synchronization for schema-assisted Explorer editing without owning field layout or JSON mutation.
 * The Awtsmoos renews every boolean, number, word, and finite choice before one browser control can hold its reflected sign;
 * Awtsmoos.com lets native controls remain humble keilim: they display and report one value while the complete expert JSON world remains beyond their line.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';

/**
 * @description Creates one native input/select appropriate for an already-validated Simple-schema field descriptor.
 * @param {Document} documentKli DOM document that owns the generated control.
 * @param {object} fieldBinah Simple field descriptor containing `control`, `type`, `required`, and optional enum values.
 * @param {string} fieldIdYesod Stable local control ID used by the owning label.
 * @returns {HTMLInputElement|HTMLSelectElement} Native local Explorer control.
 * @throws {TypeError} When the descriptor names a control family outside the supported primitive set.
 */
export function createApiExplorerSimpleControl(documentKli, fieldBinah, fieldIdYesod) {
	if (fieldBinah.control === 'select') return createEnumSelect(documentKli, fieldBinah, fieldIdYesod);
	if (!['checkbox', 'number', 'text'].includes(fieldBinah.control)) {
		throw new TypeError(`B"H | Unsupported Explorer Simple control "${fieldBinah.control}".`);
	}
	return createApiExplorerElement(documentKli, 'input', {
		className: 'simple-input',
		attributes: {
			id: fieldIdYesod,
			step: fieldBinah.type === 'integer' ? '1' : fieldBinah.type === 'number' ? 'any' : null,
			type: fieldBinah.control
		}
	});
}

/**
 * @description Reads one native Simple control into its raw primitive/encoded-enum value while preserving optional enum absence as `undefined`.
 * @param {HTMLInputElement|HTMLSelectElement} controlKli Native Simple control.
 * @param {object} fieldBinah Field descriptor that determines checkbox/select semantics.
 * @returns {unknown} Boolean checked state, decoded enum primitive, raw text/number text, or undefined for an optional unset enum.
 */
export function readApiExplorerSimpleControl(controlKli, fieldBinah) {
	if (fieldBinah.control === 'checkbox') return Boolean(controlKli.checked);
	if (fieldBinah.control === 'select') {
		return controlKli.value === '' ? undefined : JSON.parse(controlKli.value);
	}
	return controlKli.value;
}

/**
 * @description Reflects canonical JSON property presence/value evidence into one native Simple control without mutating editor JSON or inventing missing defaults.
 * @param {HTMLInputElement|HTMLSelectElement} controlKli Native Simple control.
 * @param {object} fieldBinah Field descriptor defining control semantics.
 * @param {{found:boolean,value:unknown}} stateBinah Canonical property-presence evidence from Advanced JSON.
 * @returns {void} Mutates only native control presentation state.
 */
export function syncApiExplorerSimpleControl(controlKli, fieldBinah, stateBinah) {
	controlKli.dataset.valuePresent = stateBinah.found ? 'true' : 'false';
	if (fieldBinah.control === 'checkbox') {
		controlKli.indeterminate = !stateBinah.found;
		controlKli.checked = stateBinah.found && Boolean(stateBinah.value);
		return;
	}
	controlKli.value = stateBinah.found
		? fieldBinah.control === 'select' ? JSON.stringify(stateBinah.value) : String(stateBinah.value)
		: '';
}

/**
 * @description Enables or disables one Simple native control while preserving its current displayed value for later resynchronization.
 * @param {HTMLInputElement|HTMLSelectElement} controlKli Native Simple control.
 * @param {boolean} disabledOhr Whether interaction should be disabled.
 * @returns {void} Mutates only the native disabled state.
 */
export function setApiExplorerSimpleControlDisabled(controlKli, disabledOhr) {
	controlKli.disabled = Boolean(disabledOhr);
}

/**
 * @description Creates one enum select whose option values are JSON-encoded so string, number, and boolean enum identity round-trips exactly.
 * @param {Document} documentKli DOM document that owns the select and options.
 * @param {object} fieldBinah Enum-backed Simple field descriptor.
 * @param {string} fieldIdYesod Stable local select ID.
 * @returns {HTMLSelectElement} Native select containing the schema's finite enum values and optional unset choice.
 */
function createEnumSelect(documentKli, fieldBinah, fieldIdYesod) {
	const selectKli = createApiExplorerElement(documentKli, 'select', {
		className: 'simple-input',
		attributes: { id: fieldIdYesod }
	});
	if (!fieldBinah.required) selectKli.append(createOption(documentKli, '', 'Not set'));
	for (const valueOhr of fieldBinah.enumValues || []) {
		selectKli.append(createOption(documentKli, JSON.stringify(valueOhr), String(valueOhr)));
	}
	return selectKli;
}

/**
 * @description Creates one native enum option from encoded machine value and visible label.
 * @param {Document} documentKli Owning DOM document.
 * @param {string} valueYesod JSON-encoded machine value, or empty string for optional absence.
 * @param {string} labelHod Human-readable visible label.
 * @returns {HTMLOptionElement} Native option element.
 */
function createOption(documentKli, valueYesod, labelHod) {
	return createApiExplorerElement(documentKli, 'option', {
		attributes: { value: valueYesod },
		text: labelHod
	});
}
