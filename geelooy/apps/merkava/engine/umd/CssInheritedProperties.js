//B"H
//Boruch Hashem
//Blessed be He

{
const INHERITED = new Set([
	"color",
	"cursor",
	"direction",
	"font-family",
	"font-feature-settings",
	"font-kerning",
	"font-size",
	"font-stretch",
	"font-style",
	"font-variant",
	"font-weight",
	"letter-spacing",
	"line-height",
	"list-style-image",
	"list-style-position",
	"list-style-type",
	"quotes",
	"text-align",
	"text-indent",
	"text-transform",
	"visibility",
	"white-space",
	"word-spacing",
	"writing-mode"
]);

/** Returns whether a property inherits by default in the current CSS core. */
function isInheritedCssProperty(name) {
	return String(name || "").startsWith("--") || INHERITED.has(String(name || "").toLowerCase());
}

const AwtsExports = { isInheritedCssProperty };
if (typeof module === "object" && module.exports) {
	module.exports = AwtsExports;
} else {
	globalThis.Merkava = globalThis.Merkava || {};
	Object.assign(globalThis.Merkava, AwtsExports);
}
}
