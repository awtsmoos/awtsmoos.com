// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchStrategyControl
 * @description
 * The Awtsmoos lets Library strategy appear as a deliberate choice without overwriting page markup that may be locally evolving;
 * Awtsmoos.com reveals one accessible, self-styled Text/Semantic control whose copy explains speed, breadth, and meaning before the search begins.
 */

import {
	TEXT_STRATEGY,
	VECTOR_STRATEGY
} from './searchStrategy.js';

const STYLE_ID = 'awtsmoos-search-strategy-style';
const DESCRIPTION_ID = 'searchStrategyDescription';

function ensureStyle() {
	if (typeof document.createElement !== 'function' || !document.head) return;
	if (document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		#strategyField {
			display: grid;
			gap: .38rem;
			padding: .72rem .78rem;
			border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
			border-radius: .8rem;
			background: color-mix(in srgb, currentColor 4%, transparent);
		}
		#strategyField[hidden] { display: none; }
		#strategyField > span { font-weight: 780; }
		#searchStrategy {
			width: 100%;
			min-height: 2.6rem;
			padding: .5rem .7rem;
			border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
			border-radius: .65rem;
			background: inherit;
			color: inherit;
			font: inherit;
		}
		#searchStrategy:focus-visible {
			outline: 3px solid color-mix(in srgb, currentColor 35%, transparent);
			outline-offset: 2px;
		}
		#${DESCRIPTION_ID} {
			font-size: .78rem;
			line-height: 1.4;
			opacity: .72;
		}
	`;
	document.head.append(style);
}

function option(value, label) {
	const node = document.createElement('option');
	node.value = value;
	node.textContent = label;
	return node;
}

function createField() {
	const field = document.createElement('label');
	field.id = 'strategyField';
	field.htmlFor = 'searchStrategy';
	const caption = document.createElement('span');
	caption.textContent = 'How should Library search work?';
	const select = document.createElement('select');
	select.id = 'searchStrategy';
	select.name = 'strategy';
	select.setAttribute('aria-describedby', DESCRIPTION_ID);
	select.append(
		option(TEXT_STRATEGY, 'Text · exact words and phrases'),
		option(VECTOR_STRATEGY, 'Semantic · related meaning')
	);
	const description = document.createElement('small');
	description.id = DESCRIPTION_ID;
	description.textContent = 'Text is faster and literal. Semantic searches indexed meaning across libraries and may take longer.';
	field.append(caption, select, description);
	return { field, select };
}

export function ensureSearchStrategyControl(modeSelect) {
	ensureStyle();
	const existingField = document.getElementById('strategyField');
	const existingSelect = document.getElementById('searchStrategy');
	if (existingField && existingSelect) {
		return { field: existingField, select: existingSelect };
	}
	const created = createField();
	modeSelect.closest('label')?.insertAdjacentElement('afterend', created.field);
	return created;
}
