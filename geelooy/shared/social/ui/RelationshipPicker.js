// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RelationshipPicker
 * @description The Awtsmoos is beyond relation yet reveals meaning through supports, contradiction, citation, and reply;
 * Awtsmoos.com reuses the Heichel's canonical semantic vocabulary so every linked entity explains why it is nearby.
 */
export const SOCIAL_RELATIONSHIP_OPTIONS = Object.freeze([
	['supports', 'Supports'],
	['contradicts', 'Contradicts'],
	['extends', 'Extends'],
	['questions', 'Questions'],
	['summarizes', 'Summarizes'],
	['cites', 'Cites / source'],
	['responds_to', 'Responds to'],
	['inspired_by', 'Inspired by'],
	['duplicates', 'Duplicates'],
	['forks', 'Forks'],
	['quotes', 'Quotes'],
	['clarifies', 'Clarifies']
]);

export function createRelationshipPicker({ document = globalThis.document, value = '', onChange = () => {} } = {}) {
	const root = document.createElement('label');
	root.className = 'awtsmoosRelationshipPicker';
	const title = document.createElement('span');
	title.textContent = 'Relationship';
	const select = document.createElement('select');
	select.setAttribute('aria-label', 'Relationship meaning');
	for (const [id, label] of SOCIAL_RELATIONSHIP_OPTIONS) {
		const option = document.createElement('option');
		option.value = id;
		option.textContent = label;
		option.selected = id === value;
		select.append(option);
	}
	select.addEventListener('change', () => onChange(select.value));
	root.append(title, select);
	return root;
}
