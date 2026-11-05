// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUiActionIdentity.js
 * @description Gives every rendered interactive control one deterministic programmatic identity.
 * The Awtsmoos renews each human gesture before hand or machine can claim it; Awtsmoos.com
 * names the finite control from explicit covenant first, then from its stable data-bearing vessel.
 */

const IGNORED_DATA_NAMES = new Set([
	'api-action-resolved',
	'api-generated-control',
	'selection',
	'state',
	'status',
	'workspace'
]);

export function createMovieStudioUiActionBaseId(element) {
	const explicit = clean(element?.dataset?.apiAction);
	if (explicit) return explicit;
	const attributes = Array.from(element?.attributes || [])
		.filter(attribute => attribute.name.startsWith('data-'))
		.filter(attribute => !IGNORED_DATA_NAMES.has(attribute.name.slice(5)))
		.sort((left, right) => left.name.localeCompare(right.name));
	const primary = attributes[0];
	if (primary) {
		const suffix = clean(primary.value);
		return suffix
			? `${primary.name.slice(5)}.${slug(suffix)}`
			: primary.name.slice(5);
	}
	const name = clean(element?.name);
	if (name) return `name.${slug(name)}`;
	const id = clean(element?.id);
	if (id) return `id.${slug(id)}`;
	return `control.${String(element?.tagName || 'unknown').toLowerCase()}`;
}

export function describeMovieStudioUiActionElement(element, id) {
	return Object.freeze({
		checked: typeof element?.checked === 'boolean' ? element.checked : null,
		control: controlType(element),
		disabled: Boolean(element?.disabled || element?.getAttribute?.('aria-disabled') === 'true'),
		hidden: Boolean(element?.hidden || element?.getAttribute?.('aria-hidden') === 'true'),
		id,
		label: controlLabel(element, id),
		value: valueOf(element)
	});
}

function controlLabel(element, fallback) {
	return clean(
		element?.getAttribute?.('aria-label')
			|| element?.title
			|| element?.textContent
			|| element?.name
			|| fallback
	).slice(0, 160);
}

function controlType(element) {
	const tag = String(element?.tagName || '').toLowerCase();
	return String(element?.type || element?.getAttribute?.('role') || tag || 'control').toLowerCase();
}

function valueOf(element) {
	if (!('value' in (element || {}))) return null;
	if (String(element?.type).toLowerCase() === 'password') return null;
	return String(element.value ?? '').slice(0, 2048);
}

function clean(value) {
	return String(value || '').trim().replace(/\s+/g, ' ');
}

function slug(value) {
	return clean(value).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-|-$/g, '');
}
