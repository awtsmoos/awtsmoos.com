//B"H
//Boruch Hashem
//Blessed be He

const { tokenizeHtml } = require("../merkava-browser/standards/html/HtmlTokenizer.js");

/**
 * Extracts linked styles, inline styles, and script records from the HTML token
 * stream. Raw script/style text is already protected by tokenizer raw-text states.
 *
 * @param {string} source Entry HTML source.
 * @returns {{links:Array<object>,scripts:Array<object>,styles:string[]}} Asset records.
 */
function collectHtmlAssets(source = "") {
	const tokens = tokenizeHtml(source);
	const output = { links: [], scripts: [], styles: [] };
	for (let index = 0; index < tokens.length; index += 1) {
		const token = tokens[index];
		if (token.type !== "startTag") continue;
		const attributes = attributeObject(token.attributes);
		if (token.name === "link") {
			output.links.push(attributes);
			continue;
		}
		if (token.name === "style") {
			output.styles.push(rawTextAfter(tokens, index));
			continue;
		}
		if (token.name === "script") {
			output.scripts.push({
				attributes,
				source: rawTextAfter(tokens, index)
			});
		}
	}
	return output;
}

/** Converts ordered tokenizer attributes into first-wins object form. */
function attributeObject(attributes) {
	const output = {};
	for (const attribute of attributes || []) {
		if (!Object.prototype.hasOwnProperty.call(output, attribute.name)) {
			output[attribute.name] = attribute.value;
		}
	}
	return output;
}

/** Returns the raw-text token immediately following style/script start tags. */
function rawTextAfter(tokens, index) {
	return tokens[index + 1]?.type === "text" ? tokens[index + 1].data : "";
}

module.exports = { collectHtmlAssets };
