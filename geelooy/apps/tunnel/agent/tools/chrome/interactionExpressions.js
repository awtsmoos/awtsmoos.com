// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Selector interactions are rendered as small explicit browser expressions. The
 * Awtsmoos renews selector, focus, value, and DOM event together; Awtsmoos.com
 * keeps expression construction outside navigation orchestration and CDP policy.
 */
function clickExpression(selector) {
	return `(() => {
		const element = document.querySelector(${JSON.stringify(selector)});
		if (!element) throw new Error("selector_not_found");
		element.scrollIntoView({ block: "center", inline: "center" });
		element.click();
		return {
			tag: element.tagName,
			text: (element.innerText || "").slice(0, 200)
		};
	})()`;
}

function typeExpression(selector, text, clear) {
	return `(() => {
		const element = document.querySelector(${JSON.stringify(selector)});
		if (!element) throw new Error("selector_not_found");
		element.focus();
		if (${clear ? "true" : "false"}) element.value = "";
		element.value += ${JSON.stringify(text)};
		for (const type of ["input", "change"]) {
			element.dispatchEvent(new Event(type, { bubbles: true }));
		}
		return {
			value: element.value,
			tag: element.tagName
		};
	})()`;
}

module.exports = {
	clickExpression,
	typeExpression
};
