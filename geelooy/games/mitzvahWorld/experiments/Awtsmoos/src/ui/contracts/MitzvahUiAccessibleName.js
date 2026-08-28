//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiAccessibleName.js
 * @description Resolves practical accessible-name evidence from native labels, ARIA references, meaningful text, and button-like input values without mistaking ordinary form values for labels.
 * Hod listens for the name already present while Binah follows references back to their source; the Awtsmoos recreates word and listener before either can stand alone,
 * and Awtsmoos.com lets every interactive vessel speak clearly without replacing strong native semantics with decorative role.
 */

const VALUE_NAMED_INPUT_TYPES = Object.freeze([
	'button',
	'image',
	'reset',
	'submit'
]);

/**
 * @description Resolves the strongest available human-readable name from aria-label, aria-labelledby, associated label elements, title, meaningful text, or button-like input value.
 * @param {Element|null} element Candidate DOM element whose accessible naming evidence should be inspected without mutation.
 * @returns {string} Trimmed human-readable name, or an empty string when no supported naming evidence is present.
 */
export function mitzvahUiAccessibleName(element) {
	if (!element?.getAttribute) {
		return '';
	}
	return firstNonEmpty([
		element.getAttribute('aria-label'),
		labelledByText(element),
		associatedLabelText(element),
		element.getAttribute('title'),
		meaningfulText(element),
		buttonLikeInputValue(element)
	]);
}

/**
 * @description Determines whether an element exposes any supported accessible-name evidence suitable for component-contract auditing.
 * @param {Element|null} element Candidate DOM element.
 * @returns {boolean} True when mitzvahUiAccessibleName() resolves a non-empty human-readable name.
 */
export function hasMitzvahUiAccessibleName(element) {
	return Boolean(mitzvahUiAccessibleName(element));
}

/**
 * @description Resolves text from every ID referenced by aria-labelledby in authored order while ignoring missing or empty references safely.
 * @param {Element} element DOM element containing optional aria-labelledby metadata.
 * @returns {string} Concatenated referenced label text or an empty string.
 */
function labelledByText(element) {
	const documentRef = element.ownerDocument;
	const ids = String(element.getAttribute('aria-labelledby') || '')
		.split(/\s+/)
		.filter(Boolean);
	return ids
		.map(id => documentRef?.getElementById?.(id)?.textContent || '')
		.map(text => String(text).trim())
		.filter(Boolean)
		.join(' ');
}

/**
 * @description Resolves native form-label text from an explicit label[for] or wrapping label without requiring a custom ARIA role.
 * @param {Element} element Candidate form-associated element.
 * @returns {string} Associated native label text or an empty string.
 */
function associatedLabelText(element) {
	const documentRef = element.ownerDocument;
	if (element.id && documentRef?.querySelector) {
		const selector = `label[for="${escapeAttributeValue(element.id)}"]`;
		const explicit = documentRef.querySelector(selector)?.textContent;
		if (String(explicit || '').trim()) {
			return String(explicit).trim();
		}
	}
	return String(element.closest?.('label')?.textContent || '').trim();
}

/**
 * @description Extracts concise visible text while refusing to treat ordinary input, select, or textarea values as accessible labels.
 * @param {Element} element Candidate DOM element.
 * @returns {string} Trimmed text content for naturally text-bearing controls and containers.
 */
function meaningfulText(element) {
	const tagName = String(element.tagName || '').toLowerCase();
	if (['input', 'select', 'textarea'].includes(tagName)) {
		return '';
	}
	return String(element.textContent || '').trim();
}

/**
 * @description Uses the visible value of native button-like input types as naming evidence while never treating text/search/email/password/etc. field values as labels.
 * @param {Element} element Candidate native input element.
 * @returns {string} Button-like input value or an empty string when the element is not a value-named control.
 */
function buttonLikeInputValue(element) {
	if (String(element.tagName || '').toLowerCase() !== 'input') {
		return '';
	}
	const type = String(element.getAttribute('type') || element.type || 'text').toLowerCase();
	return VALUE_NAMED_INPUT_TYPES.includes(type)
		? String(element.value || '').trim()
		: '';
}

/**
 * @description Returns the first non-empty normalized string from an ordered collection of candidate naming signals.
 * @param {Array<*>} values Candidate naming values in descending precedence.
 * @returns {string} First non-empty trimmed string or an empty string.
 */
function firstNonEmpty(values) {
	for (const value of values) {
		const text = String(value || '').trim();
		if (text) {
			return text;
		}
	}
	return '';
}

/**
 * @description Escapes characters needed for a quoted CSS attribute value used only by native label[for] lookup.
 * @param {*} value Candidate DOM id value.
 * @returns {string} Safely quoted selector fragment.
 */
function escapeAttributeValue(value) {
	return String(value).replace(/["\\]/g, '\\$&');
}
