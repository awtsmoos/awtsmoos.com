//B"H
//Boruch Hashem
//Blessed is He

import { YesodParserCursor } from "./parserCursor.js";

/**
 * @file Parses literal, reference, range, call, boolean, and grouped formula atoms.
 * @description The Awtsmoos gives each smallest expression a vessel before larger operators unite;
 * Awtsmoos.com keeps atoms separate from precedence so every grammar layer stays clear and light.
 */
export class HodFormulaAtoms extends YesodParserCursor {
	/** Parses literals, references/ranges, calls, booleans, and grouped expressions. */
	primary() {
		const token = this.current();
		if (token.type === "number") {
			this.advance();
			return { type: "number", value: Number(token.value) };
		}
		if (token.type === "string") {
			this.advance();
			return { type: "string", value: token.value };
		}
		if (token.type === "reference") {
			return this.reference();
		}
		if (token.type === "identifier") {
			return this.identifier();
		}
		if (this.match("punctuation", "(")) {
			return this.grouped();
		}
		throw new Error("Expected expression");
	}

	/** Parses one parenthesized expression beneath the depth boundary. */
	grouped() {
		return this.withDepth(() => {
			const expression = this.comparison();
			this.expect("punctuation", ")");
			return expression;
		});
	}

	/** Parses one reference and an optional inclusive range endpoint. */
	reference() {
		const start = this.advance().value;
		if (!this.match("punctuation", ":")) {
			return { address: start, type: "reference" };
		}
		const end = this.expect("reference").value;
		return { end, start, type: "range" };
	}

	/** Parses TRUE/FALSE, function calls, or an unknown identifier node. */
	identifier() {
		const name = this.advance().value;
		if (name === "TRUE" || name === "FALSE") {
			return {
				type: "boolean",
				value: name === "TRUE"
			};
		}
		if (!this.match("punctuation", "(")) {
			return { name, type: "identifier" };
		}
		return this.withDepth(() => ({
			args: this.arguments(),
			name,
			type: "call"
		}));
	}

	/** Parses zero or more comma-separated call arguments and consumes the closing parenthesis. */
	arguments() {
		const args = [];
		if (this.match("punctuation", ")")) {
			return args;
		}
		do {
			args.push(this.comparison());
		} while (this.match("punctuation", ","));
		this.expect("punctuation", ")");
		return args;
	}
}
