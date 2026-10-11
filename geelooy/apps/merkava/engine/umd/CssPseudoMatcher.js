//B"H
//Boruch Hashem
//Blessed be He

{
const { matchesNth, parseNthExpression } = (typeof module === "object" && module.exports ? require("./CssNthExpression.js") : globalThis.Merkava);
const { findTopLevelWord } = (typeof module === "object" && module.exports ? require("./CssSelectorScanner.js") : globalThis.Merkava);
const { splitSelectorList } = (typeof module === "object" && module.exports ? require("./CssSelectorList.js") : globalThis.Merkava);
/** Matches one pseudo-class against current DOM state and structural context.
 *
 * Dynamic-state contract (set by the embedding runtime):
 *   element.__merkavaState = { hover, active, visited, focusVisible }
 *   element.ownerDocument.__merkavaTargetId = id for :target
 */
function matchesCssPseudo(element, name, argument, matchesSelector) {
	const state = element.__merkavaState || {};
	if (name === "hover") return Boolean(state.hover);
	if (name === "active") return Boolean(state.active);
	if (name === "link") return isLinkElement(element) && !state.visited;
	if (name === "visited") return isLinkElement(element) && Boolean(state.visited);
	if (name === "target") return Boolean(element.id) && element.ownerDocument?.__merkavaTargetId === element.id;
	if (name === "focus-visible") return element.ownerDocument?.activeElement === element && state.focusVisible !== false;
	if (name === "focus-within") return containsActiveElement(element);
	if (name === "default") return isDefaultButton(element);
	if (name === "required") return Boolean(element.required);
	if (name === "optional") return isFormControl(element) && !element.required;
	if (name === "read-only") return isReadOnly(element);
	if (name === "read-write") return isFormControl(element) && !isReadOnly(element);
	if (name === "placeholder-shown") return isPlaceholderShown(element);
	if (name === "focus") return element.ownerDocument?.activeElement === element;
	if (name === "root") return element.ownerDocument?.documentElement === element;
	if (name === "checked") return Boolean(element.checked || element.selected);
	if (name === "disabled") return Boolean(element.disabled);
	if (name === "enabled") return !element.disabled;
	if (name === "empty") return isEmpty(element);
	if (name === "first-child") return childIndex(element) === 1;
	if (name === "last-child") return childIndexFromEnd(element) === 1;
	if (name === "only-child") return isOnlyChild(element);
	if (name === "first-of-type") return typeIndex(element) === 1;
	if (name === "last-of-type") return typeIndexFromEnd(element) === 1;
	if (name === "only-of-type") return isOnlyOfType(element);
	if (name === "is" || name === "where") return matchesAny(element, argument, matchesSelector);
	if (name === "not") return !matchesAny(element, argument, matchesSelector);
	if (name === "has") return matchesHas(element, argument, matchesSelector);
	if (name.startsWith("nth-")) return matchesStructuralNth(element, name, argument, matchesSelector);
	return false;
}

function matchesStructuralNth(element, name, argument, matchesSelector) {
	const split = findTopLevelWord(argument, "of");
	const expressionText = split < 0 ? argument : argument.slice(0, split);
	const filter = split < 0 ? "" : argument.slice(split + 2).trim();
	const ofType = name.includes("of-type");
	const reverse = name === "nth-last-child" || name === "nth-last-of-type";
	const expression = parseNthExpression(expressionText);
	const tag = element.localName;
	const kids = element.parentNode?.children;
	if (!filter) {
		// B"H 2026-10-09: single pass, no sibling-array allocation.
		let total = 0, index = 0;
		for (const child of kids || []) {
			if (child.nodeType !== 1) continue;
			if (ofType && child.localName !== tag) continue;
			total += 1;
			if (child === element) index = total;
		}
		if (index === 0) return false;
		const oneBased = reverse ? total - index + 1 : index;
		return matchesNth(oneBased, expression);
	}
	const list = [];
	for (const child of kids || []) {
		if (child.nodeType !== 1) continue;
		if (ofType && child.localName !== tag) continue;
		if (matchesSelector(child, filter)) list.push(child);
	}
	const rawIndex = list.indexOf(element);
	if (rawIndex < 0) return false;
	const oneBased = reverse ? list.length - rawIndex : rawIndex + 1;
	return matchesNth(oneBased, expression);
}

function matchesAny(element, argument, matchesSelector) {
	return splitSelectorList(argument).some(selector => matchesSelector(element, selector));
}

function matchesHas(element, argument, matchesSelector) {
	for (const selector of splitSelectorList(argument)) {
		const clean = selector.trim();
		if (clean.startsWith(">")) {
			// B"H 2026-10-09: hoisted slice, no filtered-array allocation.
			const sub = clean.slice(1).trim();
			for (const child of element.children || []) {
				if (child.nodeType === 1 && matchesSelector(child, sub)) return true;
			}
			continue;
		}
		if (clean.startsWith("+")) {
			const sub = clean.slice(1).trim();
			return Boolean(element.nextSibling && matchesSelector(element.nextSibling, sub));
		}
		if (clean.startsWith("~")) {
			const sub = clean.slice(1).trim();
			for (let sibling = element.nextSibling; sibling; sibling = sibling.nextSibling) {
				if (matchesSelector(sibling, sub)) return true;
			}
			continue;
		}
		// B"H 2026-10-09: iterative DFS with early exit — no full
		// descendant-array allocation.
		const stack = [];
		const roots = element.children || [];
		for (let i = roots.length - 1; i >= 0; i--) stack.push(roots[i]);
		while (stack.length > 0) {
			const node = stack.pop();
			if (node.nodeType === 1 && matchesSelector(node, clean)) return true;
			const kids = node.children || [];
			for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i]);
		}
	}
	return false;
}

function isEmpty(element) {
	return !(element.children || []).some(child => child.nodeType === 1 || child.nodeType === 3 && child.textContent);
}

/**
 * B"H 2026-10-09: structural helpers below are single-pass and
 * allocation-free — the old versions built filtered sibling arrays
 * (elementSiblings/typeSiblings) on every :first-child/:nth-child/etc.
 * test. Semantics preserved exactly, including the detached-node edge
 * cases (childIndex 0 / childIndexFromEnd 1 with no parent).
 */
function childIndex(element) {
	const kids = element.parentNode?.children;
	if (!kids) return 0;
	let n = 0;
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.nodeType !== 1) continue;
		n += 1;
		if (child === element) return n;
	}
	return 0;
}

function childIndexFromEnd(element) {
	const kids = element.parentNode?.children;
	if (!kids) return 1;
	let total = 0, index = 0;
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.nodeType !== 1) continue;
		total += 1;
		if (child === element) index = total;
	}
	return index === 0 ? total + 1 : total - index + 1;
}

function typeIndex(element) {
	const kids = element.parentNode?.children;
	if (!kids) return 0;
	const tag = element.localName;
	let n = 0;
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.nodeType !== 1 || child.localName !== tag) continue;
		n += 1;
		if (child === element) return n;
	}
	return 0;
}

function typeIndexFromEnd(element) {
	const kids = element.parentNode?.children;
	if (!kids) return 1;
	const tag = element.localName;
	let total = 0, index = 0;
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.nodeType !== 1 || child.localName !== tag) continue;
		total += 1;
		if (child === element) index = total;
	}
	return index === 0 ? total + 1 : total - index + 1;
}

function isOnlyChild(element) {
	const kids = element.parentNode?.children;
	if (!kids) return false;
	let n = 0;
	for (let i = 0; i < kids.length; i++) {
		if (kids[i].nodeType !== 1) continue;
		n += 1;
		if (n > 1) return false;
	}
	return n === 1;
}

function isOnlyOfType(element) {
	const kids = element.parentNode?.children;
	if (!kids) return false;
	const tag = element.localName;
	let n = 0;
	for (let i = 0; i < kids.length; i++) {
		const child = kids[i];
		if (child.nodeType !== 1 || child.localName !== tag) continue;
		n += 1;
		if (n > 1) return false;
	}
	return n === 1;
}

const LINK_ELEMENTS = new Set(["a", "area", "link"]);
const FORM_CONTROLS = new Set(["input", "textarea", "select", "button"]);

function isLinkElement(element) {
	return LINK_ELEMENTS.has(element.localName) && element.getAttribute?.("href") != null;
}

function isFormControl(element) {
	return FORM_CONTROLS.has(element.localName);
}

function containsActiveElement(element) {
	const active = element.ownerDocument?.activeElement;
	if (!active || active === element) return active === element ? false : false;
	let node = active.parentNode;
	while (node) {
		if (node === element) return true;
		node = node.parentNode;
	}
	return false;
}

function isDefaultButton(element) {
	if (element.localName === "button") {
		const type = String(element.getAttribute?.("type") || "submit").toLowerCase();
		return type === "submit";
	}
	if (element.localName === "input") {
		const type = String(element.getAttribute?.("type") || "text").toLowerCase();
		if (type === "submit" || type === "image") return true;
		if ((type === "checkbox" || type === "radio") && element.checked) return true;
	}
	if (element.localName === "option") return Boolean(element.selected);
	return false;
}

function isReadOnly(element) {
	if (!isFormControl(element)) return true;
	if (element.disabled) return true;
	if (element.getAttribute?.("readonly") != null) return true;
	if (element.localName === "input") {
		const type = String(element.getAttribute?.("type") || "text").toLowerCase();
		if (["checkbox", "radio", "submit", "button", "reset", "image", "file", "hidden"].includes(type)) return true;
	}
	return false;
}

function isPlaceholderShown(element) {
	if (element.localName !== "input" && element.localName !== "textarea") return false;
	if (element.getAttribute?.("placeholder") == null) return false;
	const value = element.value != null ? String(element.value) : String(element.getAttribute?.("value") || "");
	return value === "";
}

const AwtsExports = { matchesCssPseudo };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
