// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReaderWordTokenizer
 * @description The Awtsmoos temporarily reveals Hebrew words as touchable vessels,
 * then returns every letter to ordinary reader text when selection ends.
 */
const WORD_PATTERN = /(?:[\u05D0-\u05EA][\u0591-\u05C7]*)+(?:['"׳״-](?:[\u05D0-\u05EA][\u0591-\u05C7]*)+)*/gu;
const SKIP_SELECTOR = [
	'a',
	'button',
	'input',
	'textarea',
	'select',
	'script',
	'style',
	'[contenteditable="true"]',
	'.awtsmoos-word-token'
].join(',');

function eligibleTextNodes(root) {
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			if (!node.textContent?.match(/[\u05D0-\u05EA]/u)) {
				return NodeFilter.FILTER_REJECT;
			}
			if (node.parentElement?.closest(SKIP_SELECTOR)) {
				return NodeFilter.FILTER_REJECT;
			}
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	const nodes = [];
	while (walker.nextNode()) {
		nodes.push(walker.currentNode);
	}
	return nodes;
}

function createToken(text, identifier) {
	const element = document.createElement('button');
	element.type = 'button';
	element.className = 'awtsmoos-word-token';
	element.dataset.wordTokenId = identifier;
	element.setAttribute('aria-pressed', 'false');
	element.lang = 'he';
	element.dir = 'rtl';
	element.textContent = text;
	return { id: identifier, text, element };
}

function tokenizeNode(node, seedRange, state) {
	const value = node.textContent || '';
	const fragment = document.createDocumentFragment();
	let cursor = 0;
	for (const match of value.matchAll(WORD_PATTERN)) {
		const start = match.index ?? 0;
		if (start > cursor) {
			fragment.append(document.createTextNode(value.slice(cursor, start)));
		}
		const token = createToken(match[0], `awtsmoos-word-${state.tokens.length}`);
		state.tokens.push(token);
		fragment.append(token.element);
		const seedOffset = seedRange?.startContainer === node ? seedRange.startOffset : -1;
		if (seedOffset >= start && seedOffset <= start + match[0].length) {
			state.seedToken = token;
		}
		cursor = start + match[0].length;
	}
	if (cursor < value.length) {
		fragment.append(document.createTextNode(value.slice(cursor)));
	}
	if (state.tokens.length > state.previousCount) {
		state.parents.add(node.parentNode);
		node.replaceWith(fragment);
	}
}

export function tokenizeReader(root, seedRange = null) {
	const state = {
		parents: new Set(),
		previousCount: 0,
		seedToken: null,
		tokens: []
	};
	eligibleTextNodes(root).forEach(node => {
		state.previousCount = state.tokens.length;
		tokenizeNode(node, seedRange, state);
	});
	return {
		tokens: state.tokens,
		seedToken: state.seedToken,
		restore() {
			state.tokens.forEach(token => {
				token.element.replaceWith(document.createTextNode(token.text));
			});
			state.parents.forEach(parent => parent?.normalize?.());
		}
	};
}
