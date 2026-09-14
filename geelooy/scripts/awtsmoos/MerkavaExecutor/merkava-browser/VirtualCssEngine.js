//B"H
//Boruch Hashem
//Blessed be He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory(
			require("./CssValueResolver.js"),
			require("./standards/css/CssRuleCompiler.js"),
			require("./standards/css/CssCascade.js"),
			require("./standards/css/CssDeclarationParser.js"),
			require("./standards/css/CssDeclarationExpander.js"),
			require("./standards/css/CssSpecificity.js")
		);
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualCssEngine = factory(
			root.Merkava,
			root.Merkava,
			root.Merkava,
			root.Merkava,
			root.Merkava,
			root.Merkava
		).VirtualCssEngine;
	}
})(typeof self !== "undefined" ? self : this, function(valueMod, compiler, cascade, declarationMod, expander, specificityMod) {
	const CssValueResolver = valueMod.CssValueResolver;

	/**
	 * Standards-oriented CSS engine coordinating tokenizer/parser/selector/cascade modules.
	 * Browser language semantics stay in Merkava; native hosts receive computed results only.
	 */
	class VirtualCssEngine {
		constructor(options = {}) {
			this.atRules = [];
			this.environment = {
				height: Number(options.height || 768),
				supports: options.supports,
				type: options.type || "screen",
				width: Number(options.width || 1024)
			};
			this.order = 0;
			this.rules = [];
			this.values = new CssValueResolver();
		}

		/** Adds one programmatic author rule using tuple specificity and source order. */
		addRule(selector, declarations) {
			const clean = String(selector || "").trim();
			if (!clean) return;
			this.rules.push(Object.freeze({
				declarations: compiler.declarationsFromObject(declarations),
				order: this.order,
				selector: clean,
				specificity: Object.freeze([0, ...specificityMod.cssSpecificity(clean)])
			}));
			this.order += 1;
		}

		/** Parses and compiles stylesheet text without regex rule extraction. */
		parseStyleSheet(cssText) {
			const compiled = compiler.compileCssStyleSheet(cssText, this.environment, this.order);
			this.rules.push(...compiled.rules);
			this.atRules.push(...compiled.atRules);
			this.order = compiled.nextOrder;
		}

		/** Computes cascaded and resolved declarations for one virtual DOM element. */
		compute(element) {
			const parent = element?.parentNode?.nodeType === 1 ? this.compute(element.parentNode) : {};
			const inline = inlineDeclarations(element, declarationMod);
			const raw = cascade.cascadeCss(element, this.rules, parent, inline);
			const expanded = expander.expandCssDeclarations(raw);
			return this.values.resolveDeclarations(expanded, parent);
		}

		/** Updates viewport facts used by media-query evaluation for future stylesheets. */
		setEnvironment(values = {}) {
			Object.assign(this.environment, values);
		}
	}

	function inlineDeclarations(element, parser) {
		const declarations = element?.getAttribute?.("style")
			? parser.parseCssDeclarations(element.getAttribute("style"))
			: [];
		const parsedNames = new Set(declarations.map(item => item.name));
		for (const [name, value] of Object.entries(element?.style?.toJSON?.() || {})) {
			if (parsedNames.has(name)) continue;
			declarations.push(Object.freeze({ important: false, name, value: String(value) }));
		}
		return declarations;
	}

	return { VirtualCssEngine };
});
