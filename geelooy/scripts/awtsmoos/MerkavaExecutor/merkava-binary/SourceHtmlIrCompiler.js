//B"H
//Boruch Hashem
//Blessed be He

const { tokenizeHtml } = require("../merkava-browser/standards/html/HtmlTokenizer.js");
const { VOID_TAGS } = require("../merkava-browser/standards/html/HtmlTreeSupport.js");

const SKIP_TAGS = new Set(["html", "head", "body", "style", "script", "link"]);

/**
 * Compiles HTML source into the transitional MWEB node IR using the same
 * executor-owned tokenizer as runtime hydration. This removes regex tag parsing
 * while preserving the v3 parent-by-id representation until node handles land.
 *
 * @param {string} source HTML source text.
 * @returns {Array<object>} Transitional web node records.
 */
function parseHtmlNodes(source = "") {
	const nodes = [];
	const stack = [];
	for (const token of tokenizeHtml(source)) {
		if (token.type === "startTag") {
			openNode(token, nodes, stack);
		} else if (token.type === "endTag") {
			closeNode(token.name, stack);
		} else if (token.type === "text") {
			appendNodeText(token.data, stack);
		}
	}
	return nodes;
}

/** Materializes one non-structural start tag into transitional node IR. */
function openNode(token, nodes, stack) {
	if (SKIP_TAGS.has(token.name)) {
		return;
	}
	const attrs = attributeObject(token.attributes);
	const node = {
		attrs,
		id: attrs.id || "",
		parent: attrs["data-parent"] || nearestParentId(stack),
		tag: token.name,
		text: ""
	};
	nodes.push(node);
	if (!token.selfClosing && !VOID_TAGS.has(token.name)) {
		stack.push(node);
	}
}

/** Recovers from malformed closing tags by popping through the matching tag. */
function closeNode(tagName, stack) {
	if (SKIP_TAGS.has(tagName)) {
		return;
	}
	for (let index = stack.length - 1; index >= 0; index -= 1) {
		if (stack[index].tag === tagName) {
			stack.length = index;
			return;
		}
	}
}

/** Appends decoded text to the currently open transitional node. */
function appendNodeText(value, stack) {
	if (!stack.length) {
		return;
	}
	const text = String(value).trim();
	if (text) {
		stack[stack.length - 1].text += text;
	}
}

/** Converts the tokenizer's ordered attribute list to first-wins object form. */
function attributeObject(attributes) {
	const output = {};
	for (const attribute of attributes || []) {
		if (!Object.prototype.hasOwnProperty.call(output, attribute.name)) {
			output[attribute.name] = attribute.value;
		}
	}
	return output;
}

/** Finds the nearest ancestor that v3 MWEB can address by public id. */
function nearestParentId(stack) {
	for (let index = stack.length - 1; index >= 0; index -= 1) {
		if (stack[index].id) {
			return stack[index].id;
		}
	}
	return "";
}

module.exports = { parseHtmlNodes };
