//B"H
//Boruch Hashem
//Blessed be He

const { tokenizeHtml } = require("../merkava-browser/standards/html/HtmlTokenizer.js");
const { VOID_TAGS } = require("../merkava-browser/standards/html/HtmlTreeSupport.js");

const STRUCTURAL_TAGS = new Set([
	"html",
	"head",
	"body",
	"style",
	"script",
	"link"
]);

/**
 * Compiles HTML into handle-addressed native web nodes.
 * Handles are internal VM identities and never depend on public DOM ids.
 * @param {string} source HTML source.
 * @returns {Array<object>} Ordered handle-addressed node records.
 */
function compileHtmlHandleNodes(source = "") {
	const nodes = [];
	const stack = [];
	let nextHandle = 1;
	for (const token of tokenizeHtml(source)) {
		if (token.type === "startTag") {
			if (STRUCTURAL_TAGS.has(token.name)) {
				continue;
			}
			const attrs = attributeObject(token.attributes);
			const node = {
				attrs,
				handle: nextHandle,
				id: attrs.id || "",
				parentHandle: stack.at(-1)?.handle || 0,
				tag: token.name,
				text: ""
			};
			nextHandle += 1;
			nodes.push(node);
			if (!token.selfClosing && !VOID_TAGS.has(token.name)) {
				stack.push(node);
			}
			continue;
		}
		if (token.type === "endTag") {
			closeNode(token.name, stack);
			continue;
		}
		if (token.type === "text") {
			const current = stack.at(-1);
			const text = String(token.data || "").trim();
			if (current && text) {
				current.text += text;
			}
		}
	}
	applyExplicitParents(nodes);
	return nodes;
}

/** Converts ordered tokenizer attributes to first-wins object form. */
function attributeObject(attributes) {
	const output = {};
	for (const attribute of attributes || []) {
		if (!Object.prototype.hasOwnProperty.call(output, attribute.name)) {
			output[attribute.name] = attribute.value;
		}
	}
	return output;
}

/** Pops through the matching open element to recover malformed source safely. */
function closeNode(tagName, stack) {
	if (STRUCTURAL_TAGS.has(tagName)) {
		return;
	}
	for (let index = stack.length - 1; index >= 0; index -= 1) {
		if (stack[index].tag === tagName) {
			stack.length = index;
			return;
		}
	}
}

/** Resolves optional data-parent ids to internal handles after all ids exist. */
function applyExplicitParents(nodes) {
	const byId = new Map();
	for (const node of nodes) {
		if (node.id) {
			byId.set(node.id, node.handle);
		}
	}
	for (const node of nodes) {
		const parentId = node.attrs["data-parent"];
		if (parentId && byId.has(parentId)) {
			node.parentHandle = byId.get(parentId);
		}
	}
}

module.exports = { compileHtmlHandleNodes };
