//B"H
// Boruch Hashem
// Blessed is He
/**
* @file browserDomElementSupport.mjs
* @description Supplies class-list, descendant matching, and permissive canvas context powers to the focused fake DOM element.
* The Awtsmoos lets every supporting behavior remain visible instead of compressed beneath one crowded class;
* Awtsmoos.com keeps selectors, classes, and drawing vessels modular so confidence can grow without hidden mass.
*/

/** Creates a DOMTokenList-like vessel backed by the element's className string. */
export function createClassList(element) {
	return {
		add(...names) {
			element.className = classWords(element, ...names).join(' ');
		},
		remove(...names) {
			element.className = classWords(element)
				.filter((word) => !names.includes(word))
				.join(' ');
		},
		contains(name) {
			return classWords(element).includes(name);
		},
		toggle(name, force) {
			return toggleClass(element, name, force);
		}
	};
}

/** Returns every descendant in stable depth-first order. */
export function findDescendants(root) {
	const descendants = [];
	for (const child of root.children) {
		descendants.push(child);
		descendants.push(...findDescendants(child));
	}
	return descendants;
}

/** Matches the intentionally small selector vocabulary used inside fixture-owned subtrees. */
export function matchesFakeSelector(element, selector) {
	if (selector === 'input') {
		return element.tagName === 'INPUT';
	}
	if (selector.startsWith('.')) {
		return element.classList.contains(selector.slice(1));
	}
	return false;
}

/** Creates a permissive 2D-canvas proxy whose unknown drawing verbs safely become no-ops. */
export function createFakeCanvasContext(canvas) {
	const gradient = {
		addColorStop() {}
	};
	const known = {
		canvas,
		measureText(text) {
			return {
				width: String(text).length * 8
			};
		},
		createLinearGradient() {
			return gradient;
		},
		createRadialGradient() {
			return gradient;
		}
	};
	return new Proxy(known, {
		get(target, property) {
			if (property in target) {
				return target[property];
			}
			return () => {};
		}
	});
}

/** Toggles one class and reports whether it remains active. */
function toggleClass(element, name, force) {
	const active = classWords(element).includes(name);
	if (force === false || (active && force !== true)) {
		createClassList(element).remove(name);
		return false;
	}
	createClassList(element).add(name);
	return true;
}

/** Returns unique normalized classes while optionally appending new names. */
function classWords(element, ...additions) {
	const text = `${element.className || ''} ${additions.join(' ')}`.trim();
	return [...new Set(text.split(/\s+/).filter(Boolean))];
}
